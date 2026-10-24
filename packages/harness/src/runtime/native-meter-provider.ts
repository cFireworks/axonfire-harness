// @ts-nocheck
// Captured meter, storage, collector and provider statements; explicit resources boundary.
export const METER_PROVIDER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const METER_PROVIDER_REGIONS = [
  [8000040, 8000224],
  [8000224, 8005105],
  [8005105, 8005165],
  [8005165, 8016029],
  [8016029, 8016109],
  [8016109, 8017765],
  [8017765, 8018208],
  [8018208, 8018379],
  [8018379, 8018535],
  [8018535, 8018745],
  [8018745, 8019199],
  [8019199, 8019509],
  [8019509, 8041543],
  [8041543, 8041659],
  [8041659, 8043796],
] as const;
export const METER_PROVIDER_MODULES = [[36182, 979683, 983225]] as const;
export function createNativeMeterProvider(runtime: any) {
  const factories = {
      36182(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            NOOP_COUNTER_METRIC: () => e_,
            NOOP_GAUGE_METRIC: () => eI,
            NOOP_HISTOGRAM_METRIC: () => ev,
            NOOP_METER: () => eB,
            NOOP_OBSERVABLE_COUNTER_METRIC: () => eQ,
            NOOP_OBSERVABLE_GAUGE_METRIC: () => eD,
            NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC: () => eT,
            NOOP_UP_DOWN_COUNTER_METRIC: () => eS,
            NoopCounterMetric: () => eg,
            NoopGaugeMetric: () => ef,
            NoopHistogramMetric: () => em,
            NoopMeter: () => ed,
            NoopMetric: () => ep,
            NoopObservableCounterMetric: () => eC,
            NoopObservableGaugeMetric: () => ey,
            NoopObservableMetric: () => eE,
            NoopObservableUpDownCounterMetric: () => ew,
            NoopUpDownCounterMetric: () => eh,
            createNoopMeter: () => createNoopMeter,
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
          ed = (function () {
            function NoopMeter() {}
            return (
              (NoopMeter.prototype.createGauge = function (eA, el) {
                return eI;
              }),
              (NoopMeter.prototype.createHistogram = function (eA, el) {
                return ev;
              }),
              (NoopMeter.prototype.createCounter = function (eA, el) {
                return e_;
              }),
              (NoopMeter.prototype.createUpDownCounter = function (eA, el) {
                return eS;
              }),
              (NoopMeter.prototype.createObservableGauge = function (eA, el) {
                return eD;
              }),
              (NoopMeter.prototype.createObservableCounter = function (eA, el) {
                return eQ;
              }),
              (NoopMeter.prototype.createObservableUpDownCounter = function (
                eA,
                el,
              ) {
                return eT;
              }),
              (NoopMeter.prototype.addBatchObservableCallback = function (
                eA,
                el,
              ) {}),
              (NoopMeter.prototype.removeBatchObservableCallback = function (
                eA,
              ) {}),
              NoopMeter
            );
          })(),
          ep = (function () {
            return function () {};
          })(),
          eg = (function (eA) {
            function NoopCounterMetric() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              eu(NoopCounterMetric, eA),
              (NoopCounterMetric.prototype.add = function (eA, el) {}),
              NoopCounterMetric
            );
          })(ep),
          eh = (function (eA) {
            function NoopUpDownCounterMetric() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              eu(NoopUpDownCounterMetric, eA),
              (NoopUpDownCounterMetric.prototype.add = function (eA, el) {}),
              NoopUpDownCounterMetric
            );
          })(ep),
          ef = (function (eA) {
            function NoopGaugeMetric() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              eu(NoopGaugeMetric, eA),
              (NoopGaugeMetric.prototype.record = function (eA, el) {}),
              NoopGaugeMetric
            );
          })(ep),
          em = (function (eA) {
            function NoopHistogramMetric() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              eu(NoopHistogramMetric, eA),
              (NoopHistogramMetric.prototype.record = function (eA, el) {}),
              NoopHistogramMetric
            );
          })(ep),
          eE = (function () {
            function NoopObservableMetric() {}
            return (
              (NoopObservableMetric.prototype.addCallback = function (eA) {}),
              (NoopObservableMetric.prototype.removeCallback = function (
                eA,
              ) {}),
              NoopObservableMetric
            );
          })(),
          eC = (function (eA) {
            function NoopObservableCounterMetric() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              eu(NoopObservableCounterMetric, eA),
              NoopObservableCounterMetric
            );
          })(eE),
          ey = (function (eA) {
            function NoopObservableGaugeMetric() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              eu(NoopObservableGaugeMetric, eA),
              NoopObservableGaugeMetric
            );
          })(eE),
          ew = (function (eA) {
            function NoopObservableUpDownCounterMetric() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              eu(NoopObservableUpDownCounterMetric, eA),
              NoopObservableUpDownCounterMetric
            );
          })(eE),
          eB = new ed(),
          e_ = new eg(),
          eI = new ef(),
          ev = new em(),
          eS = new eh(),
          eQ = new eC(),
          eD = new ey(),
          eT = new ew();
        function createNoopMeter() {
          return eB;
        }
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

  const { AI, AT, AM, AQ, Ak } = runtime.readers.meterHelpers,
    {
      hashAttributes,
      isDescriptorCompatibleWith,
      PromiseAllSettled,
      isPromiseAllSettledRejectionResult,
      callWithTimeout,
      setEquals,
      isNotNullish,
      createInstrumentDescriptorWithView,
      instrumentationScopeId,
    } = runtime.metrics.meterHelpers,
    tG = runtime.metrics.Aggregation,
    eg = runtime.metrics.InstrumentType,
    ep = runtime.metrics.AggregationTemporality,
    createInstrumentDescriptor = runtime.metrics.createInstrumentDescriptor,
    eZ = { diag: runtime.diag },
    eR = runtime.serializers.getModule(11447),
    e1 = runtime.serializers.getModule(41437),
    eM = runtime.resources;
  function isSelectorNotProvided(eA) {
    return (
      null == eA.instrumentName &&
      null == eA.instrumentType &&
      null == eA.instrumentUnit &&
      null == eA.meterName &&
      null == eA.meterVersion &&
      null == eA.meterSchemaUrl
    );
  }
  var Ax = (function () {
      return function (eA) {
        var el;
        if (isSelectorNotProvided(eA))
          throw Error("Cannot create view with no selector arguments supplied");
        if (
          null != eA.name &&
          ((null == eA ? void 0 : eA.instrumentName) == null ||
            AI.hasWildcard(eA.instrumentName))
        )
          throw Error(
            "Views with a specified name must be declared with an instrument selector that selects at most one instrument per meter.",
          );
        (null != eA.attributeKeys
          ? (this.attributesProcessor = new AT(eA.attributeKeys))
          : (this.attributesProcessor = AQ.Noop()),
          (this.name = eA.name),
          (this.description = eA.description),
          (this.aggregation =
            null != (el = eA.aggregation) ? el : tG.Default()),
          (this.instrumentSelector = new Ak({
            name: eA.instrumentName,
            type: eA.instrumentType,
            unit: eA.instrumentUnit,
          })),
          (this.meterSelector = new AM({
            name: eA.meterName,
            version: eA.meterVersion,
            schemaUrl: eA.meterSchemaUrl,
          })),
          (this.aggregationCardinalityLimit = eA.aggregationCardinalityLimit));
      };
    })(),
    AO = ec(36182),
    AN = (function () {
      function ViewRegistry() {
        this._registeredViews = [];
      }
      return (
        (ViewRegistry.prototype.addView = function (eA) {
          this._registeredViews.push(eA);
        }),
        (ViewRegistry.prototype.findViews = function (eA, el) {
          var ec = this;
          return this._registeredViews.filter(function (eu) {
            return (
              ec._matchInstrument(eu.instrumentSelector, eA) &&
              ec._matchMeter(eu.meterSelector, el)
            );
          });
        }),
        (ViewRegistry.prototype._matchInstrument = function (eA, el) {
          return (
            (void 0 === eA.getType() || el.type === eA.getType()) &&
            eA.getNameFilter().match(el.name) &&
            eA.getUnitFilter().match(el.unit)
          );
        }),
        (ViewRegistry.prototype._matchMeter = function (eA, el) {
          return (
            eA.getNameFilter().match(el.name) &&
            (void 0 === el.version ||
              eA.getVersionFilter().match(el.version)) &&
            (void 0 === el.schemaUrl ||
              eA.getSchemaUrlFilter().match(el.schemaUrl))
          );
        }),
        ViewRegistry
      );
    })(),
    AP = ec(33835),
    AL = (function () {
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
    AF = (function () {
      function SyncInstrument(eA, el) {
        ((this._writableMetricStorage = eA), (this._descriptor = el));
      }
      return (
        (SyncInstrument.prototype._record = function (eA, el, ec) {
          (void 0 === el && (el = {}),
          void 0 === ec && (ec = AP.context.active()),
          "number" != typeof eA)
            ? eZ.diag.warn(
                "non-number value provided to metric " +
                  this._descriptor.name +
                  ": " +
                  eA,
              )
            : (this._descriptor.valueType !== eR.ValueType.INT ||
                Number.isInteger(eA) ||
                (eZ.diag.warn(
                  "INT value type cannot accept a floating-point value for " +
                    this._descriptor.name +
                    ", ignoring the fractional digits.",
                ),
                Number.isInteger((eA = Math.trunc(eA))))) &&
              this._writableMetricStorage.record(
                eA,
                el,
                ec,
                (0, e1.millisToHrTime)(Date.now()),
              );
        }),
        SyncInstrument
      );
    })(),
    AU = (function (eA) {
      function UpDownCounterInstrument() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        AL(UpDownCounterInstrument, eA),
        (UpDownCounterInstrument.prototype.add = function (eA, el, ec) {
          this._record(eA, el, ec);
        }),
        UpDownCounterInstrument
      );
    })(AF),
    Aj = (function (eA) {
      function CounterInstrument() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        AL(CounterInstrument, eA),
        (CounterInstrument.prototype.add = function (eA, el, ec) {
          eA < 0
            ? eZ.diag.warn(
                "negative value provided to counter " +
                  this._descriptor.name +
                  ": " +
                  eA,
              )
            : this._record(eA, el, ec);
        }),
        CounterInstrument
      );
    })(AF),
    AG = (function (eA) {
      function GaugeInstrument() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        AL(GaugeInstrument, eA),
        (GaugeInstrument.prototype.record = function (eA, el, ec) {
          this._record(eA, el, ec);
        }),
        GaugeInstrument
      );
    })(AF),
    AH = (function (eA) {
      function HistogramInstrument() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        AL(HistogramInstrument, eA),
        (HistogramInstrument.prototype.record = function (eA, el, ec) {
          eA < 0
            ? eZ.diag.warn(
                "negative value provided to histogram " +
                  this._descriptor.name +
                  ": " +
                  eA,
              )
            : this._record(eA, el, ec);
        }),
        HistogramInstrument
      );
    })(AF),
    AK = (function () {
      function ObservableInstrument(eA, el, ec) {
        ((this._observableRegistry = ec),
          (this._descriptor = eA),
          (this._metricStorages = el));
      }
      return (
        (ObservableInstrument.prototype.addCallback = function (eA) {
          this._observableRegistry.addCallback(eA, this);
        }),
        (ObservableInstrument.prototype.removeCallback = function (eA) {
          this._observableRegistry.removeCallback(eA, this);
        }),
        ObservableInstrument
      );
    })(),
    A$ = (function (eA) {
      function ObservableCounterInstrument() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (AL(ObservableCounterInstrument, eA), ObservableCounterInstrument);
    })(AK),
    AY = (function (eA) {
      function ObservableGaugeInstrument() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (AL(ObservableGaugeInstrument, eA), ObservableGaugeInstrument);
    })(AK),
    AJ = (function (eA) {
      function ObservableUpDownCounterInstrument() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        AL(ObservableUpDownCounterInstrument, eA),
        ObservableUpDownCounterInstrument
      );
    })(AK);
  function isObservableInstrument(eA) {
    return eA instanceof AK;
  }
  var Aq = (function () {
      function Meter(eA) {
        this._meterSharedState = eA;
      }
      return (
        (Meter.prototype.createGauge = function (eA, el) {
          var ec = createInstrumentDescriptor(eA, eg.GAUGE, el);
          return new AG(this._meterSharedState.registerMetricStorage(ec), ec);
        }),
        (Meter.prototype.createHistogram = function (eA, el) {
          var ec = createInstrumentDescriptor(eA, eg.HISTOGRAM, el);
          return new AH(this._meterSharedState.registerMetricStorage(ec), ec);
        }),
        (Meter.prototype.createCounter = function (eA, el) {
          var ec = createInstrumentDescriptor(eA, eg.COUNTER, el);
          return new Aj(this._meterSharedState.registerMetricStorage(ec), ec);
        }),
        (Meter.prototype.createUpDownCounter = function (eA, el) {
          var ec = createInstrumentDescriptor(eA, eg.UP_DOWN_COUNTER, el);
          return new AU(this._meterSharedState.registerMetricStorage(ec), ec);
        }),
        (Meter.prototype.createObservableGauge = function (eA, el) {
          var ec = createInstrumentDescriptor(eA, eg.OBSERVABLE_GAUGE, el),
            eu = this._meterSharedState.registerAsyncMetricStorage(ec);
          return new AY(ec, eu, this._meterSharedState.observableRegistry);
        }),
        (Meter.prototype.createObservableCounter = function (eA, el) {
          var ec = createInstrumentDescriptor(eA, eg.OBSERVABLE_COUNTER, el),
            eu = this._meterSharedState.registerAsyncMetricStorage(ec);
          return new A$(ec, eu, this._meterSharedState.observableRegistry);
        }),
        (Meter.prototype.createObservableUpDownCounter = function (eA, el) {
          var ec = createInstrumentDescriptor(
              eA,
              eg.OBSERVABLE_UP_DOWN_COUNTER,
              el,
            ),
            eu = this._meterSharedState.registerAsyncMetricStorage(ec);
          return new AJ(ec, eu, this._meterSharedState.observableRegistry);
        }),
        (Meter.prototype.addBatchObservableCallback = function (eA, el) {
          this._meterSharedState.observableRegistry.addBatchCallback(eA, el);
        }),
        (Meter.prototype.removeBatchObservableCallback = function (eA, el) {
          this._meterSharedState.observableRegistry.removeBatchCallback(eA, el);
        }),
        Meter
      );
    })(),
    Az = (function () {
      function MetricStorage(eA) {
        this._instrumentDescriptor = eA;
      }
      return (
        (MetricStorage.prototype.getInstrumentDescriptor = function () {
          return this._instrumentDescriptor;
        }),
        (MetricStorage.prototype.updateDescription = function (eA) {
          this._instrumentDescriptor = createInstrumentDescriptor(
            this._instrumentDescriptor.name,
            this._instrumentDescriptor.type,
            {
              description: eA,
              valueType: this._instrumentDescriptor.valueType,
              unit: this._instrumentDescriptor.unit,
              advice: this._instrumentDescriptor.advice,
            },
          );
        }),
        MetricStorage
      );
    })(),
    AW = (function () {
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
    HashMap_generator = function (eA, el) {
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
    AV = (function (eA) {
      function AttributeHashMap() {
        return eA.call(this, hashAttributes) || this;
      }
      return (AW(AttributeHashMap, eA), AttributeHashMap);
    })(
      (function () {
        function HashMap(eA) {
          ((this._hash = eA),
            (this._valueMap = new Map()),
            (this._keyMap = new Map()));
        }
        return (
          (HashMap.prototype.get = function (eA, el) {
            return (
              null != el || (el = this._hash(eA)),
              this._valueMap.get(el)
            );
          }),
          (HashMap.prototype.getOrDefault = function (eA, el) {
            var ec = this._hash(eA);
            if (this._valueMap.has(ec)) return this._valueMap.get(ec);
            var eu = el();
            return (
              this._keyMap.has(ec) || this._keyMap.set(ec, eA),
              this._valueMap.set(ec, eu),
              eu
            );
          }),
          (HashMap.prototype.set = function (eA, el, ec) {
            (null != ec || (ec = this._hash(eA)),
              this._keyMap.has(ec) || this._keyMap.set(ec, eA),
              this._valueMap.set(ec, el));
          }),
          (HashMap.prototype.has = function (eA, el) {
            return (
              null != el || (el = this._hash(eA)),
              this._valueMap.has(el)
            );
          }),
          (HashMap.prototype.keys = function () {
            var eA, el;
            return HashMap_generator(this, function (ec) {
              switch (ec.label) {
                case 0:
                  ((el = (eA = this._keyMap.entries()).next()), (ec.label = 1));
                case 1:
                  if (!0 === el.done) return [3, 3];
                  return [4, [el.value[1], el.value[0]]];
                case 2:
                  return (ec.sent(), (el = eA.next()), [3, 1]);
                case 3:
                  return [2];
              }
            });
          }),
          (HashMap.prototype.entries = function () {
            var eA, el;
            return HashMap_generator(this, function (ec) {
              switch (ec.label) {
                case 0:
                  ((el = (eA = this._valueMap.entries()).next()),
                    (ec.label = 1));
                case 1:
                  if (!0 === el.done) return [3, 3];
                  return [
                    4,
                    [this._keyMap.get(el.value[0]), el.value[1], el.value[0]],
                  ];
                case 2:
                  return (ec.sent(), (el = eA.next()), [3, 1]);
                case 3:
                  return [2];
              }
            });
          }),
          Object.defineProperty(HashMap.prototype, "size", {
            get: function () {
              return this._valueMap.size;
            },
            enumerable: !1,
            configurable: !0,
          }),
          HashMap
        );
      })(),
    ),
    DeltaMetricProcessor_read = function (eA, el) {
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
    AZ = (function () {
      function DeltaMetricProcessor(eA, el) {
        ((this._aggregator = eA),
          (this._activeCollectionStorage = new AV()),
          (this._cumulativeMemoStorage = new AV()),
          (this._overflowAttributes = { "otel.metric.overflow": !0 }),
          (this._cardinalityLimit = (null != el ? el : 2e3) - 1),
          (this._overflowHashCode = hashAttributes(this._overflowAttributes)));
      }
      return (
        (DeltaMetricProcessor.prototype.record = function (eA, el, ec, eu) {
          var ed = this,
            ep = this._activeCollectionStorage.get(el);
          if (!ep) {
            if (this._activeCollectionStorage.size >= this._cardinalityLimit) {
              var eg = this._activeCollectionStorage.getOrDefault(
                this._overflowAttributes,
                function () {
                  return ed._aggregator.createAccumulation(eu);
                },
              );
              null == eg || eg.record(eA);
              return;
            }
            ((ep = this._aggregator.createAccumulation(eu)),
              this._activeCollectionStorage.set(el, ep));
          }
          null == ep || ep.record(eA);
        }),
        (DeltaMetricProcessor.prototype.batchCumulate = function (eA, el) {
          var ec = this;
          Array.from(eA.entries()).forEach(function (eA) {
            var eu = DeltaMetricProcessor_read(eA, 3),
              ed = eu[0],
              ep = eu[1],
              eg = eu[2],
              eh = ec._aggregator.createAccumulation(el);
            null == eh || eh.record(ep);
            var ef = eh;
            if (ec._cumulativeMemoStorage.has(ed, eg)) {
              var em = ec._cumulativeMemoStorage.get(ed, eg);
              ef = ec._aggregator.diff(em, eh);
            } else if (
              ec._cumulativeMemoStorage.size >= ec._cardinalityLimit &&
              ((ed = ec._overflowAttributes),
              (eg = ec._overflowHashCode),
              ec._cumulativeMemoStorage.has(ed, eg))
            ) {
              var em = ec._cumulativeMemoStorage.get(ed, eg);
              ef = ec._aggregator.diff(em, eh);
            }
            if (ec._activeCollectionStorage.has(ed, eg)) {
              var eE = ec._activeCollectionStorage.get(ed, eg);
              ef = ec._aggregator.merge(eE, ef);
            }
            (ec._cumulativeMemoStorage.set(ed, eh, eg),
              ec._activeCollectionStorage.set(ed, ef, eg));
          });
        }),
        (DeltaMetricProcessor.prototype.collect = function () {
          var eA = this._activeCollectionStorage;
          return ((this._activeCollectionStorage = new AV()), eA);
        }),
        DeltaMetricProcessor
      );
    })(),
    TemporalMetricProcessor_values = function (eA) {
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
    TemporalMetricProcessor_read = function (eA, el) {
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
    AX = (function () {
      function TemporalMetricProcessor(eA, el) {
        var ec = this;
        ((this._aggregator = eA),
          (this._unreportedAccumulations = new Map()),
          (this._reportHistory = new Map()),
          el.forEach(function (eA) {
            ec._unreportedAccumulations.set(eA, []);
          }));
      }
      return (
        (TemporalMetricProcessor.prototype.buildMetrics = function (
          eA,
          el,
          ec,
          eu,
        ) {
          this._stashAccumulations(ec);
          var ed,
            eg = this._getMergedUnreportedAccumulations(eA),
            eh = eg;
          if (this._reportHistory.has(eA)) {
            var ef = this._reportHistory.get(eA),
              em = ef.collectionTime;
            eh =
              (ed = ef.aggregationTemporality) === ep.CUMULATIVE
                ? TemporalMetricProcessor.merge(
                    ef.accumulations,
                    eg,
                    this._aggregator,
                  )
                : TemporalMetricProcessor.calibrateStartTime(
                    ef.accumulations,
                    eg,
                    em,
                  );
          } else ed = eA.selectAggregationTemporality(el.type);
          this._reportHistory.set(eA, {
            accumulations: eh,
            collectionTime: eu,
            aggregationTemporality: ed,
          });
          var eE = AttributesMapToAccumulationRecords(eh);
          if (0 !== eE.length)
            return this._aggregator.toMetricData(el, ed, eE, eu);
        }),
        (TemporalMetricProcessor.prototype._stashAccumulations = function (eA) {
          var el,
            ec,
            eu = this._unreportedAccumulations.keys();
          try {
            for (
              var ed = TemporalMetricProcessor_values(eu), ep = ed.next();
              !ep.done;
              ep = ed.next()
            ) {
              var eg = ep.value,
                eh = this._unreportedAccumulations.get(eg);
              (void 0 === eh &&
                ((eh = []), this._unreportedAccumulations.set(eg, eh)),
                eh.push(eA));
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
        }),
        (TemporalMetricProcessor.prototype._getMergedUnreportedAccumulations =
          function (eA) {
            var el,
              ec,
              eu = new AV(),
              ed = this._unreportedAccumulations.get(eA);
            if ((this._unreportedAccumulations.set(eA, []), void 0 === ed))
              return eu;
            try {
              for (
                var ep = TemporalMetricProcessor_values(ed), eg = ep.next();
                !eg.done;
                eg = ep.next()
              ) {
                var eh = eg.value;
                eu = TemporalMetricProcessor.merge(eu, eh, this._aggregator);
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
            return eu;
          }),
        (TemporalMetricProcessor.merge = function (eA, el, ec) {
          for (
            var eu = eA, ed = el.entries(), ep = ed.next();
            !0 !== ep.done;

          ) {
            var eg = TemporalMetricProcessor_read(ep.value, 3),
              eh = eg[0],
              ef = eg[1],
              em = eg[2];
            if (eA.has(eh, em)) {
              var eE = eA.get(eh, em),
                eC = ec.merge(eE, ef);
              eu.set(eh, eC, em);
            } else eu.set(eh, ef, em);
            ep = ed.next();
          }
          return eu;
        }),
        (TemporalMetricProcessor.calibrateStartTime = function (eA, el, ec) {
          var eu, ed;
          try {
            for (
              var ep = TemporalMetricProcessor_values(eA.keys()),
                eg = ep.next();
              !eg.done;
              eg = ep.next()
            ) {
              var eh = TemporalMetricProcessor_read(eg.value, 2),
                ef = eh[0],
                em = eh[1],
                eE = el.get(ef, em);
              null == eE || eE.setStartTime(ec);
            }
          } catch (eA) {
            eu = { error: eA };
          } finally {
            try {
              eg && !eg.done && (ed = ep.return) && ed.call(ep);
            } finally {
              if (eu) throw eu.error;
            }
          }
          return el;
        }),
        TemporalMetricProcessor
      );
    })();
  function AttributesMapToAccumulationRecords(eA) {
    return Array.from(eA.entries());
  }
  var A0 = (function () {
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
    AsyncMetricStorage_read = function (eA, el) {
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
    A1 = (function (eA) {
      function AsyncMetricStorage(el, ec, eu, ed, ep) {
        var eg = eA.call(this, el) || this;
        return (
          (eg._attributesProcessor = eu),
          (eg._aggregationCardinalityLimit = ep),
          (eg._deltaMetricStorage = new AZ(
            ec,
            eg._aggregationCardinalityLimit,
          )),
          (eg._temporalMetricStorage = new AX(ec, ed)),
          eg
        );
      }
      return (
        A0(AsyncMetricStorage, eA),
        (AsyncMetricStorage.prototype.record = function (eA, el) {
          var ec = this,
            eu = new AV();
          (Array.from(eA.entries()).forEach(function (eA) {
            var el = AsyncMetricStorage_read(eA, 2),
              ed = el[0],
              ep = el[1];
            eu.set(ec._attributesProcessor.process(ed), ep);
          }),
            this._deltaMetricStorage.batchCumulate(eu, el));
        }),
        (AsyncMetricStorage.prototype.collect = function (eA, el) {
          var ec = this._deltaMetricStorage.collect();
          return this._temporalMetricStorage.buildMetrics(
            eA,
            this._instrumentDescriptor,
            ec,
            el,
          );
        }),
        AsyncMetricStorage
      );
    })(Az);
  function getIncompatibilityDetails(eA, el) {
    var ec = "";
    return (
      eA.unit !== el.unit &&
        (ec += "	- Unit '" + eA.unit + "' does not match '" + el.unit + "'\n"),
      eA.type !== el.type &&
        (ec += "	- Type '" + eA.type + "' does not match '" + el.type + "'\n"),
      eA.valueType !== el.valueType &&
        (ec +=
          "	- Value Type '" +
          eA.valueType +
          "' does not match '" +
          el.valueType +
          "'\n"),
      eA.description !== el.description &&
        (ec +=
          "	- Description '" +
          eA.description +
          "' does not match '" +
          el.description +
          "'\n"),
      ec
    );
  }
  function getValueTypeConflictResolutionRecipe(eA, el) {
    return (
      "	- use valueType '" +
      eA.valueType +
      "' on instrument creation or use an instrument name other than '" +
      el.name +
      "'"
    );
  }
  function getUnitConflictResolutionRecipe(eA, el) {
    return (
      "	- use unit '" +
      eA.unit +
      "' on instrument creation or use an instrument name other than '" +
      el.name +
      "'"
    );
  }
  function getTypeConflictResolutionRecipe(eA, el) {
    var ec = JSON.stringify({ name: el.name, type: el.type, unit: el.unit });
    return (
      "	- create a new view with a name other than '" +
      eA.name +
      "' and InstrumentSelector '" +
      ec +
      "'"
    );
  }
  function getDescriptionResolutionRecipe(eA, el) {
    var ec = JSON.stringify({ name: el.name, type: el.type, unit: el.unit });
    return (
      "	- create a new view with a name other than '" +
      eA.name +
      "' and InstrumentSelector '" +
      ec +
      "'\n    	- OR - create a new view with the name " +
      eA.name +
      " and description '" +
      eA.description +
      "' and InstrumentSelector " +
      ec +
      "\n    	- OR - create a new view with the name " +
      el.name +
      " and description '" +
      eA.description +
      "' and InstrumentSelector " +
      ec
    );
  }
  function getConflictResolutionRecipe(eA, el) {
    return eA.valueType !== el.valueType
      ? getValueTypeConflictResolutionRecipe(eA, el)
      : eA.unit !== el.unit
        ? getUnitConflictResolutionRecipe(eA, el)
        : eA.type !== el.type
          ? getTypeConflictResolutionRecipe(eA, el)
          : eA.description !== el.description
            ? getDescriptionResolutionRecipe(eA, el)
            : "";
  }
  var MetricStorageRegistry_values = function (eA) {
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
    A2 = (function () {
      function MetricStorageRegistry() {
        ((this._sharedRegistry = new Map()),
          (this._perCollectorRegistry = new Map()));
      }
      return (
        (MetricStorageRegistry.create = function () {
          return new MetricStorageRegistry();
        }),
        (MetricStorageRegistry.prototype.getStorages = function (eA) {
          var el,
            ec,
            eu,
            ed,
            ep = [];
          try {
            for (
              var eg = MetricStorageRegistry_values(
                  this._sharedRegistry.values(),
                ),
                eh = eg.next();
              !eh.done;
              eh = eg.next()
            ) {
              var ef = eh.value;
              ep = ep.concat(ef);
            }
          } catch (eA) {
            el = { error: eA };
          } finally {
            try {
              eh && !eh.done && (ec = eg.return) && ec.call(eg);
            } finally {
              if (el) throw el.error;
            }
          }
          var em = this._perCollectorRegistry.get(eA);
          if (null != em)
            try {
              for (
                var eE = MetricStorageRegistry_values(em.values()),
                  eC = eE.next();
                !eC.done;
                eC = eE.next()
              ) {
                var ef = eC.value;
                ep = ep.concat(ef);
              }
            } catch (eA) {
              eu = { error: eA };
            } finally {
              try {
                eC && !eC.done && (ed = eE.return) && ed.call(eE);
              } finally {
                if (eu) throw eu.error;
              }
            }
          return ep;
        }),
        (MetricStorageRegistry.prototype.register = function (eA) {
          this._registerStorage(eA, this._sharedRegistry);
        }),
        (MetricStorageRegistry.prototype.registerForCollector = function (
          eA,
          el,
        ) {
          var ec = this._perCollectorRegistry.get(eA);
          (null == ec &&
            ((ec = new Map()), this._perCollectorRegistry.set(eA, ec)),
            this._registerStorage(el, ec));
        }),
        (MetricStorageRegistry.prototype.findOrUpdateCompatibleStorage =
          function (eA) {
            var el = this._sharedRegistry.get(eA.name);
            return void 0 === el
              ? null
              : this._findOrUpdateCompatibleStorage(eA, el);
          }),
        (MetricStorageRegistry.prototype.findOrUpdateCompatibleCollectorStorage =
          function (eA, el) {
            var ec = this._perCollectorRegistry.get(eA);
            if (void 0 === ec) return null;
            var eu = ec.get(el.name);
            return void 0 === eu
              ? null
              : this._findOrUpdateCompatibleStorage(el, eu);
          }),
        (MetricStorageRegistry.prototype._registerStorage = function (eA, el) {
          var ec = eA.getInstrumentDescriptor(),
            eu = el.get(ec.name);
          void 0 === eu ? el.set(ec.name, [eA]) : eu.push(eA);
        }),
        (MetricStorageRegistry.prototype._findOrUpdateCompatibleStorage =
          function (eA, el) {
            var ec,
              eu,
              ed = null;
            try {
              for (
                var ep = MetricStorageRegistry_values(el), eg = ep.next();
                !eg.done;
                eg = ep.next()
              ) {
                var eh = eg.value,
                  ef = eh.getInstrumentDescriptor();
                isDescriptorCompatibleWith(ef, eA)
                  ? (ef.description !== eA.description &&
                      (eA.description.length > ef.description.length &&
                        eh.updateDescription(eA.description),
                      eZ.diag.warn(
                        "A view or instrument with the name ",
                        eA.name,
                        " has already been registered, but has a different description and is incompatible with another registered view.\n",
                        "Details:\n",
                        getIncompatibilityDetails(ef, eA),
                        "The longer description will be used.\nTo resolve the conflict:",
                        getConflictResolutionRecipe(ef, eA),
                      )),
                    (ed = eh))
                  : eZ.diag.warn(
                      "A view or instrument with the name ",
                      eA.name,
                      " has already been registered and is incompatible with another registered view.\n",
                      "Details:\n",
                      getIncompatibilityDetails(ef, eA),
                      "To resolve the conflict:\n",
                      getConflictResolutionRecipe(ef, eA),
                    );
              }
            } catch (eA) {
              ec = { error: eA };
            } finally {
              try {
                eg && !eg.done && (eu = ep.return) && eu.call(ep);
              } finally {
                if (ec) throw ec.error;
              }
            }
            return ed;
          }),
        MetricStorageRegistry
      );
    })(),
    A3 = (function () {
      function MultiMetricStorage(eA) {
        this._backingStorages = eA;
      }
      return (
        (MultiMetricStorage.prototype.record = function (eA, el, ec, eu) {
          this._backingStorages.forEach(function (ed) {
            ed.record(eA, el, ec, eu);
          });
        }),
        MultiMetricStorage
      );
    })(),
    A4 = (function () {
      function ObservableResultImpl(eA, el) {
        ((this._instrumentName = eA),
          (this._valueType = el),
          (this._buffer = new AV()));
      }
      return (
        (ObservableResultImpl.prototype.observe = function (eA, el) {
          (void 0 === el && (el = {}), "number" != typeof eA)
            ? eZ.diag.warn(
                "non-number value provided to metric " +
                  this._instrumentName +
                  ": " +
                  eA,
              )
            : (this._valueType !== eR.ValueType.INT ||
                Number.isInteger(eA) ||
                (eZ.diag.warn(
                  "INT value type cannot accept a floating-point value for " +
                    this._instrumentName +
                    ", ignoring the fractional digits.",
                ),
                Number.isInteger((eA = Math.trunc(eA))))) &&
              this._buffer.set(el, eA);
        }),
        ObservableResultImpl
      );
    })(),
    A8 = (function () {
      function BatchObservableResultImpl() {
        this._buffer = new Map();
      }
      return (
        (BatchObservableResultImpl.prototype.observe = function (eA, el, ec) {
          if ((void 0 === ec && (ec = {}), isObservableInstrument(eA))) {
            var eu = this._buffer.get(eA);
            if (
              (null == eu && ((eu = new AV()), this._buffer.set(eA, eu)),
              "number" != typeof el)
            )
              return void eZ.diag.warn(
                "non-number value provided to metric " +
                  eA._descriptor.name +
                  ": " +
                  el,
              );
            (eA._descriptor.valueType !== eR.ValueType.INT ||
              Number.isInteger(el) ||
              (eZ.diag.warn(
                "INT value type cannot accept a floating-point value for " +
                  eA._descriptor.name +
                  ", ignoring the fractional digits.",
              ),
              Number.isInteger((el = Math.trunc(el))))) &&
              eu.set(ec, el);
          }
        }),
        BatchObservableResultImpl
      );
    })(),
    ObservableRegistry_awaiter = function (eA, el, ec, eu) {
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
    ObservableRegistry_generator = function (eA, el) {
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
    ObservableRegistry_read = function (eA, el) {
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
    ObservableRegistry_spreadArray = function (eA, el, ec) {
      if (ec || 2 == arguments.length)
        for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
          (!eu && ed in el) ||
            (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
            (eu[ed] = el[ed]));
      return eA.concat(eu || Array.prototype.slice.call(el));
    },
    A5 = (function () {
      function ObservableRegistry() {
        ((this._callbacks = []), (this._batchCallbacks = []));
      }
      return (
        (ObservableRegistry.prototype.addCallback = function (eA, el) {
          this._findCallback(eA, el) >= 0 ||
            this._callbacks.push({ callback: eA, instrument: el });
        }),
        (ObservableRegistry.prototype.removeCallback = function (eA, el) {
          var ec = this._findCallback(eA, el);
          ec < 0 || this._callbacks.splice(ec, 1);
        }),
        (ObservableRegistry.prototype.addBatchCallback = function (eA, el) {
          var ec = new Set(el.filter(isObservableInstrument));
          0 === ec.size
            ? eZ.diag.error(
                "BatchObservableCallback is not associated with valid instruments",
                el,
              )
            : this._findBatchCallback(eA, ec) >= 0 ||
              this._batchCallbacks.push({ callback: eA, instruments: ec });
        }),
        (ObservableRegistry.prototype.removeBatchCallback = function (eA, el) {
          var ec = new Set(el.filter(isObservableInstrument)),
            eu = this._findBatchCallback(eA, ec);
          eu < 0 || this._batchCallbacks.splice(eu, 1);
        }),
        (ObservableRegistry.prototype.observe = function (eA, el) {
          return ObservableRegistry_awaiter(this, void 0, void 0, function () {
            var ec, eu;
            return ObservableRegistry_generator(this, function (ed) {
              switch (ed.label) {
                case 0:
                  return (
                    (ec = this._observeCallbacks(eA, el)),
                    (eu = this._observeBatchCallbacks(eA, el)),
                    [
                      4,
                      PromiseAllSettled(
                        ObservableRegistry_spreadArray(
                          ObservableRegistry_spreadArray(
                            [],
                            ObservableRegistry_read(ec),
                            !1,
                          ),
                          ObservableRegistry_read(eu),
                          !1,
                        ),
                      ),
                    ]
                  );
                case 1:
                  return [
                    2,
                    ed
                      .sent()
                      .filter(isPromiseAllSettledRejectionResult)
                      .map(function (eA) {
                        return eA.reason;
                      }),
                  ];
              }
            });
          });
        }),
        (ObservableRegistry.prototype._observeCallbacks = function (eA, el) {
          var ec = this;
          return this._callbacks.map(function (eu) {
            var ed = eu.callback,
              ep = eu.instrument;
            return ObservableRegistry_awaiter(ec, void 0, void 0, function () {
              var ec, eu;
              return ObservableRegistry_generator(this, function (eg) {
                switch (eg.label) {
                  case 0:
                    return (
                      (eu = Promise.resolve(
                        ed(
                          (ec = new A4(
                            ep._descriptor.name,
                            ep._descriptor.valueType,
                          )),
                        ),
                      )),
                      null != el && (eu = callWithTimeout(eu, el)),
                      [4, eu]
                    );
                  case 1:
                    return (
                      eg.sent(),
                      ep._metricStorages.forEach(function (el) {
                        el.record(ec._buffer, eA);
                      }),
                      [2]
                    );
                }
              });
            });
          });
        }),
        (ObservableRegistry.prototype._observeBatchCallbacks = function (
          eA,
          el,
        ) {
          var ec = this;
          return this._batchCallbacks.map(function (eu) {
            var ed = eu.callback,
              ep = eu.instruments;
            return ObservableRegistry_awaiter(ec, void 0, void 0, function () {
              var ec, eu;
              return ObservableRegistry_generator(this, function (eg) {
                switch (eg.label) {
                  case 0:
                    return (
                      (eu = Promise.resolve(ed((ec = new A8())))),
                      null != el && (eu = callWithTimeout(eu, el)),
                      [4, eu]
                    );
                  case 1:
                    return (
                      eg.sent(),
                      ep.forEach(function (el) {
                        var eu = ec._buffer.get(el);
                        null != eu &&
                          el._metricStorages.forEach(function (el) {
                            el.record(eu, eA);
                          });
                      }),
                      [2]
                    );
                }
              });
            });
          });
        }),
        (ObservableRegistry.prototype._findCallback = function (eA, el) {
          return this._callbacks.findIndex(function (ec) {
            return ec.callback === eA && ec.instrument === el;
          });
        }),
        (ObservableRegistry.prototype._findBatchCallback = function (eA, el) {
          return this._batchCallbacks.findIndex(function (ec) {
            return ec.callback === eA && setEquals(ec.instruments, el);
          });
        }),
        ObservableRegistry
      );
    })(),
    A6 = (function () {
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
    A9 = (function (eA) {
      function SyncMetricStorage(el, ec, eu, ed, ep) {
        var eg = eA.call(this, el) || this;
        return (
          (eg._attributesProcessor = eu),
          (eg._aggregationCardinalityLimit = ep),
          (eg._deltaMetricStorage = new AZ(
            ec,
            eg._aggregationCardinalityLimit,
          )),
          (eg._temporalMetricStorage = new AX(ec, ed)),
          eg
        );
      }
      return (
        A6(SyncMetricStorage, eA),
        (SyncMetricStorage.prototype.record = function (eA, el, ec, eu) {
          ((el = this._attributesProcessor.process(el, ec)),
            this._deltaMetricStorage.record(eA, el, ec, eu));
        }),
        (SyncMetricStorage.prototype.collect = function (eA, el) {
          var ec = this._deltaMetricStorage.collect();
          return this._temporalMetricStorage.buildMetrics(
            eA,
            this._instrumentDescriptor,
            ec,
            el,
          );
        }),
        SyncMetricStorage
      );
    })(Az),
    MeterSharedState_awaiter = function (eA, el, ec, eu) {
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
    MeterSharedState_generator = function (eA, el) {
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
    MeterSharedState_read = function (eA, el) {
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
    A7 = (function () {
      function MeterSharedState(eA, el) {
        ((this._meterProviderSharedState = eA),
          (this._instrumentationScope = el),
          (this.metricStorageRegistry = new A2()),
          (this.observableRegistry = new A5()),
          (this.meter = new Aq(this)));
      }
      return (
        (MeterSharedState.prototype.registerMetricStorage = function (eA) {
          var el = this._registerMetricStorage(eA, A9);
          return 1 === el.length ? el[0] : new A3(el);
        }),
        (MeterSharedState.prototype.registerAsyncMetricStorage = function (eA) {
          return this._registerMetricStorage(eA, A1);
        }),
        (MeterSharedState.prototype.collect = function (eA, el, ec) {
          return MeterSharedState_awaiter(this, void 0, void 0, function () {
            var eu, ed, ep;
            return MeterSharedState_generator(this, function (eg) {
              switch (eg.label) {
                case 0:
                  return [
                    4,
                    this.observableRegistry.observe(
                      el,
                      null == ec ? void 0 : ec.timeoutMillis,
                    ),
                  ];
                case 1:
                  if (
                    ((eu = eg.sent()),
                    0 ===
                      (ed = this.metricStorageRegistry.getStorages(eA)).length)
                  )
                    return [2, null];
                  if (
                    0 ===
                    (ep = ed
                      .map(function (ec) {
                        return ec.collect(eA, el);
                      })
                      .filter(isNotNullish)).length
                  )
                    return [2, { errors: eu }];
                  return [
                    2,
                    {
                      scopeMetrics: {
                        scope: this._instrumentationScope,
                        metrics: ep,
                      },
                      errors: eu,
                    },
                  ];
              }
            });
          });
        }),
        (MeterSharedState.prototype._registerMetricStorage = function (eA, el) {
          var ec = this,
            eu = this._meterProviderSharedState.viewRegistry
              .findViews(eA, this._instrumentationScope)
              .map(function (eu) {
                var ed = createInstrumentDescriptorWithView(eu, eA),
                  ep =
                    ec.metricStorageRegistry.findOrUpdateCompatibleStorage(ed);
                if (null != ep) return ep;
                var eg = eu.aggregation.createAggregator(ed),
                  eh = new el(
                    ed,
                    eg,
                    eu.attributesProcessor,
                    ec._meterProviderSharedState.metricCollectors,
                    eu.aggregationCardinalityLimit,
                  );
                return (ec.metricStorageRegistry.register(eh), eh);
              });
          if (0 === eu.length) {
            var ed = this._meterProviderSharedState
              .selectAggregations(eA.type)
              .map(function (eu) {
                var ed = MeterSharedState_read(eu, 2),
                  ep = ed[0],
                  eg = ed[1],
                  eh =
                    ec.metricStorageRegistry.findOrUpdateCompatibleCollectorStorage(
                      ep,
                      eA,
                    );
                if (null != eh) return eh;
                var ef = eg.createAggregator(eA),
                  em = ep.selectCardinalityLimit(eA.type),
                  eE = new el(eA, ef, AQ.Noop(), [ep], em);
                return (
                  ec.metricStorageRegistry.registerForCollector(ep, eE),
                  eE
                );
              });
            eu = eu.concat(ed);
          }
          return eu;
        }),
        MeterSharedState
      );
    })(),
    MeterProviderSharedState_values = function (eA) {
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
    rn = (function () {
      function MeterProviderSharedState(eA) {
        ((this.resource = eA),
          (this.viewRegistry = new AN()),
          (this.metricCollectors = []),
          (this.meterSharedStates = new Map()));
      }
      return (
        (MeterProviderSharedState.prototype.getMeterSharedState = function (
          eA,
        ) {
          var el = instrumentationScopeId(eA),
            ec = this.meterSharedStates.get(el);
          return (
            null == ec &&
              ((ec = new A7(this, eA)), this.meterSharedStates.set(el, ec)),
            ec
          );
        }),
        (MeterProviderSharedState.prototype.selectAggregations = function (eA) {
          var el,
            ec,
            eu = [];
          try {
            for (
              var ed = MeterProviderSharedState_values(this.metricCollectors),
                ep = ed.next();
              !ep.done;
              ep = ed.next()
            ) {
              var eg = ep.value;
              eu.push([eg, eg.selectAggregation(eA)]);
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
          return eu;
        }),
        MeterProviderSharedState
      );
    })(),
    MetricCollector_awaiter = function (eA, el, ec, eu) {
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
    MetricCollector_generator = function (eA, el) {
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
    MetricCollector_read = function (eA, el) {
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
    MetricCollector_spreadArray = function (eA, el, ec) {
      if (ec || 2 == arguments.length)
        for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
          (!eu && ed in el) ||
            (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
            (eu[ed] = el[ed]));
      return eA.concat(eu || Array.prototype.slice.call(el));
    },
    ra = (function () {
      function MetricCollector(eA, el) {
        ((this._sharedState = eA), (this._metricReader = el));
      }
      return (
        (MetricCollector.prototype.collect = function (eA) {
          return MetricCollector_awaiter(this, void 0, void 0, function () {
            var el,
              ec,
              eu,
              ed = this;
            return MetricCollector_generator(this, function (ep) {
              switch (ep.label) {
                case 0:
                  return (
                    (el = (0, e1.millisToHrTime)(Date.now())),
                    (ec = []),
                    (eu = []),
                    [
                      4,
                      Promise.all(
                        Array.from(
                          this._sharedState.meterSharedStates.values(),
                        ).map(function (ep) {
                          return MetricCollector_awaiter(
                            ed,
                            void 0,
                            void 0,
                            function () {
                              var ed;
                              return MetricCollector_generator(
                                this,
                                function (eg) {
                                  switch (eg.label) {
                                    case 0:
                                      return [4, ep.collect(this, el, eA)];
                                    case 1:
                                      return (
                                        (null == (ed = eg.sent())
                                          ? void 0
                                          : ed.scopeMetrics) != null &&
                                          ec.push(ed.scopeMetrics),
                                        (null == ed ? void 0 : ed.errors) !=
                                          null &&
                                          eu.push.apply(
                                            eu,
                                            MetricCollector_spreadArray(
                                              [],
                                              MetricCollector_read(ed.errors),
                                              !1,
                                            ),
                                          ),
                                        [2]
                                      );
                                  }
                                },
                              );
                            },
                          );
                        }),
                      ),
                    ]
                  );
                case 1:
                  return (
                    ep.sent(),
                    [
                      2,
                      {
                        resourceMetrics: {
                          resource: this._sharedState.resource,
                          scopeMetrics: ec,
                        },
                        errors: eu,
                      },
                    ]
                  );
              }
            });
          });
        }),
        (MetricCollector.prototype.forceFlush = function (eA) {
          return MetricCollector_awaiter(this, void 0, void 0, function () {
            return MetricCollector_generator(this, function (el) {
              switch (el.label) {
                case 0:
                  return [4, this._metricReader.forceFlush(eA)];
                case 1:
                  return (el.sent(), [2]);
              }
            });
          });
        }),
        (MetricCollector.prototype.shutdown = function (eA) {
          return MetricCollector_awaiter(this, void 0, void 0, function () {
            return MetricCollector_generator(this, function (el) {
              switch (el.label) {
                case 0:
                  return [4, this._metricReader.shutdown(eA)];
                case 1:
                  return (el.sent(), [2]);
              }
            });
          });
        }),
        (MetricCollector.prototype.selectAggregationTemporality = function (
          eA,
        ) {
          return this._metricReader.selectAggregationTemporality(eA);
        }),
        (MetricCollector.prototype.selectAggregation = function (eA) {
          return this._metricReader.selectAggregation(eA);
        }),
        (MetricCollector.prototype.selectCardinalityLimit = function (eA) {
          var el, ec, eu;
          return null !=
            (eu =
              null == (ec = (el = this._metricReader).selectCardinalityLimit)
                ? void 0
                : ec.call(el, eA))
            ? eu
            : 2e3;
        }),
        MetricCollector
      );
    })(),
    MeterProvider_awaiter = function (eA, el, ec, eu) {
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
    MeterProvider_generator = function (eA, el) {
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
    MeterProvider_values = function (eA) {
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
    };
  function prepareResource(eA, el) {
    var ec = null != el ? el : eM.Resource.empty();
    return eA ? eM.Resource.default().merge(ec) : ec;
  }
  var rl = (function () {
    function MeterProvider(eA) {
      if (
        ((this._shutdown = !1),
        (this._sharedState = new rn(
          prepareResource(
            null == (ep = null == eA ? void 0 : eA.mergeResourceWithDefaults) ||
              ep,
            null == eA ? void 0 : eA.resource,
          ),
        )),
        (null == eA ? void 0 : eA.views) != null && eA.views.length > 0)
      )
        try {
          for (
            var el,
              ec,
              eu,
              ed,
              ep,
              eg = MeterProvider_values(eA.views),
              eh = eg.next();
            !eh.done;
            eh = eg.next()
          ) {
            var ef = eh.value;
            this._sharedState.viewRegistry.addView(ef);
          }
        } catch (eA) {
          el = { error: eA };
        } finally {
          try {
            eh && !eh.done && (ec = eg.return) && ec.call(eg);
          } finally {
            if (el) throw el.error;
          }
        }
      if ((null == eA ? void 0 : eA.readers) != null && eA.readers.length > 0)
        try {
          for (
            var em = MeterProvider_values(eA.readers), eE = em.next();
            !eE.done;
            eE = em.next()
          ) {
            var eC = eE.value;
            this.addMetricReader(eC);
          }
        } catch (eA) {
          eu = { error: eA };
        } finally {
          try {
            eE && !eE.done && (ed = em.return) && ed.call(em);
          } finally {
            if (eu) throw eu.error;
          }
        }
    }
    return (
      (MeterProvider.prototype.getMeter = function (eA, el, ec) {
        return (void 0 === el && (el = ""),
        void 0 === ec && (ec = {}),
        this._shutdown)
          ? (eZ.diag.warn("A shutdown MeterProvider cannot provide a Meter"),
            (0, AO.createNoopMeter)())
          : this._sharedState.getMeterSharedState({
              name: eA,
              version: el,
              schemaUrl: ec.schemaUrl,
            }).meter;
      }),
      (MeterProvider.prototype.addMetricReader = function (eA) {
        var el = new ra(this._sharedState, eA);
        (eA.setMetricProducer(el), this._sharedState.metricCollectors.push(el));
      }),
      (MeterProvider.prototype.shutdown = function (eA) {
        return MeterProvider_awaiter(this, void 0, void 0, function () {
          return MeterProvider_generator(this, function (el) {
            switch (el.label) {
              case 0:
                if (this._shutdown)
                  return (
                    eZ.diag.warn(
                      "shutdown may only be called once per MeterProvider",
                    ),
                    [2]
                  );
                return (
                  (this._shutdown = !0),
                  [
                    4,
                    Promise.all(
                      this._sharedState.metricCollectors.map(function (el) {
                        return el.shutdown(eA);
                      }),
                    ),
                  ]
                );
              case 1:
                return (el.sent(), [2]);
            }
          });
        });
      }),
      (MeterProvider.prototype.forceFlush = function (eA) {
        return MeterProvider_awaiter(this, void 0, void 0, function () {
          return MeterProvider_generator(this, function (el) {
            switch (el.label) {
              case 0:
                if (this._shutdown)
                  return (
                    eZ.diag.warn(
                      "invalid attempt to force flush after MeterProvider shutdown",
                    ),
                    [2]
                  );
                return [
                  4,
                  Promise.all(
                    this._sharedState.metricCollectors.map(function (el) {
                      return el.forceFlush(eA);
                    }),
                  ),
                ];
              case 1:
                return (el.sent(), [2]);
            }
          });
        });
      }),
      MeterProvider
    );
  })();
  return { MeterProvider: rl, View: Ax, getModule: ec };
}

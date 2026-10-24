// @ts-nocheck
// Captured metric aggregation closure, exporter base and concrete Galileo constructor.
export const GALILEO_METRIC_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_METRIC_REGIONS = [
  [7935850, 7936089],
  [7938769, 7942041],
  [7942041, 7942083],
  [7942083, 7942226],
  [7942226, 7942357],
  [7942357, 7942540],
  [7942540, 7942787],
  [7942787, 7943252],
  [7943252, 7943329],
  [7943329, 7943457],
  [7943457, 7943749],
  [7943749, 7943906],
  [7943906, 7943987],
  [7943987, 7944454],
  [7944454, 7944680],
  [7944680, 7944836],
  [7944836, 7945105],
  [7945105, 7945143],
  [7945143, 7945194],
  [7945194, 7945381],
  [7945381, 7949335],
  [7949335, 7949507],
  [7949507, 7956142],
  [7956142, 7956267],
  [7956267, 7956411],
  [7956411, 7956507],
  [7956507, 7956606],
  [7956606, 7959673],
  [7959673, 7959794],
  [7959794, 7972072],
  [7972072, 7972187],
  [7972187, 7973293],
  [7973293, 7973836],
  [7973836, 7974050],
  [7974050, 7974197],
  [7974197, 7974757],
  [7978337, 7978487],
  [7978873, 7979128],
  [7982274, 7982395],
] as const;
export function createNativeGalileoMetricExporter(runtime: any) {
  function ec(id: number): any {
    const v = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (v === undefined) throw Error("Explicit metric parent required: " + id);
    return v;
  }
  const eY = runtime.exports.OTLPExporterBase,
    eZ = { diag: runtime.diag },
    eR = runtime.serializers.getModule(11447),
    e1 = runtime.serializers.getModule(41437),
    e5 = runtime.serializers.metrics,
    eG = runtime.sdk,
    createExportLogsServiceRequest =
      runtime.serializers.createExportLogsServiceRequest,
    convertLegacyHttpOptions = runtime.http.convertLegacyHttpOptions,
    createOtlpNetworkExportDelegate =
      runtime.exports.createOtlpNetworkExportDelegate,
    GalileoEncryptedOtlpHttpTransport =
      runtime.transport.GalileoEncryptedOtlpHttpTransport,
    Date = runtime.Date ?? globalThis.Date;
  let ed, ep, eg, eh, ef;
  (!(function (eA) {
    ((eA[(eA.HISTOGRAM = 0)] = "HISTOGRAM"),
      (eA[(eA.EXPONENTIAL_HISTOGRAM = 1)] = "EXPONENTIAL_HISTOGRAM"),
      (eA[(eA.GAUGE = 2)] = "GAUGE"),
      (eA[(eA.SUM = 3)] = "SUM"));
  })(ed || (ed = {})),
    (function (eA) {
      ((eA[(eA.DELTA = 0)] = "DELTA"),
        (eA[(eA.CUMULATIVE = 1)] = "CUMULATIVE"));
    })(ep || (ep = {})));
  var e6 = {
      serializeRequest: function (eA) {
        var el = createExportLogsServiceRequest(eA, {
          useHex: !0,
          useLongBits: !1,
        });
        return new TextEncoder().encode(JSON.stringify(el));
      },
      deserializeResponse: function (eA) {
        return JSON.parse(new TextDecoder().decode(eA));
      },
    },
    e9 = ec(7e4),
    e7 = (function () {
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
    utils_awaiter = function (eA, el, ec, eu) {
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
    utils_generator = function (eA, el) {
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
    utils_read = function (eA, el) {
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
    utils_values = function (eA) {
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
  function isNotNullish(eA) {
    return null != eA;
  }
  function hashAttributes(eA) {
    var el = Object.keys(eA);
    return 0 === el.length
      ? ""
      : JSON.stringify(
          (el = el.sort()).map(function (el) {
            return [el, eA[el]];
          }),
        );
  }
  function instrumentationScopeId(eA) {
    var el, ec;
    return (
      eA.name +
      ":" +
      (null != (el = eA.version) ? el : "") +
      ":" +
      (null != (ec = eA.schemaUrl) ? ec : "")
    );
  }
  var tn = (function (eA) {
    function TimeoutError(el) {
      var ec = eA.call(this, el) || this;
      return (Object.setPrototypeOf(ec, TimeoutError.prototype), ec);
    }
    return (e7(TimeoutError, eA), TimeoutError);
  })(Error);
  function callWithTimeout(eA, el) {
    var ec;
    return Promise.race([
      eA,
      new Promise(function (eA, eu) {
        ec = setTimeout(function () {
          eu(new tn("Operation timed out."));
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
  function PromiseAllSettled(eA) {
    return utils_awaiter(this, void 0, void 0, function () {
      var el = this;
      return utils_generator(this, function (ec) {
        return [
          2,
          Promise.all(
            eA.map(function (eA) {
              return utils_awaiter(el, void 0, void 0, function () {
                return utils_generator(this, function (el) {
                  switch (el.label) {
                    case 0:
                      return (el.trys.push([0, 2, , 3]), [4, eA]);
                    case 1:
                      return [2, { status: "fulfilled", value: el.sent() }];
                    case 2:
                      return [2, { status: "rejected", reason: el.sent() }];
                    case 3:
                      return [2];
                  }
                });
              });
            }),
          ),
        ];
      });
    });
  }
  function isPromiseAllSettledRejectionResult(eA) {
    return "rejected" === eA.status;
  }
  function FlatMap(eA, el) {
    var ec = [];
    return (
      eA.forEach(function (eA) {
        ec.push.apply(ec, __spreadArray([], utils_read(el(eA)), !1));
      }),
      ec
    );
  }
  function setEquals(eA, el) {
    var ec, eu;
    if (eA.size !== el.size) return !1;
    try {
      for (
        var ed = utils_values(eA), ep = ed.next();
        !ep.done;
        ep = ed.next()
      ) {
        var eg = ep.value;
        if (!el.has(eg)) return !1;
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
    return !0;
  }
  function binarySearchUB(eA, el) {
    for (var ec = 0, eu = eA.length - 1, ed = eA.length; eu >= ec; ) {
      var ep = ec + Math.trunc((eu - ec) / 2);
      eA[ep] < el ? (ec = ep + 1) : ((ed = ep), (eu = ep - 1));
    }
    return ed;
  }
  function equalsCaseInsensitive(eA, el) {
    return eA.toLowerCase() === el.toLowerCase();
  }
  function createInstrumentDescriptor(eA, el, ec) {
    var eu, ed, ep, eg;
    return (
      isValidName(eA) ||
        eZ.diag.warn(
          'Invalid metric name: "' +
            eA +
            '". The metric name should be a ASCII string with a length no greater than 255 characters.',
        ),
      {
        name: eA,
        type: el,
        description:
          null != (eu = null == ec ? void 0 : ec.description) ? eu : "",
        unit: null != (ed = null == ec ? void 0 : ec.unit) ? ed : "",
        valueType:
          null != (ep = null == ec ? void 0 : ec.valueType)
            ? ep
            : eR.ValueType.DOUBLE,
        advice: null != (eg = null == ec ? void 0 : ec.advice) ? eg : {},
      }
    );
  }
  function createInstrumentDescriptorWithView(eA, el) {
    var ec, eu;
    return {
      name: null != (ec = eA.name) ? ec : el.name,
      description: null != (eu = eA.description) ? eu : el.description,
      type: el.type,
      unit: el.unit,
      valueType: el.valueType,
      advice: el.advice,
    };
  }
  function isDescriptorCompatibleWith(eA, el) {
    return (
      equalsCaseInsensitive(eA.name, el.name) &&
      eA.unit === el.unit &&
      eA.type === el.type &&
      eA.valueType === el.valueType
    );
  }
  !(function (eA) {
    ((eA.COUNTER = "COUNTER"),
      (eA.GAUGE = "GAUGE"),
      (eA.HISTOGRAM = "HISTOGRAM"),
      (eA.UP_DOWN_COUNTER = "UP_DOWN_COUNTER"),
      (eA.OBSERVABLE_COUNTER = "OBSERVABLE_COUNTER"),
      (eA.OBSERVABLE_GAUGE = "OBSERVABLE_GAUGE"),
      (eA.OBSERVABLE_UP_DOWN_COUNTER = "OBSERVABLE_UP_DOWN_COUNTER"));
  })(eg || (eg = {}));
  var tl = /^[a-z][a-z0-9_.\-/]{0,254}$/i;
  function isValidName(eA) {
    return null != eA.match(tl);
  }
  !(function (eA) {
    ((eA[(eA.DROP = 0)] = "DROP"),
      (eA[(eA.SUM = 1)] = "SUM"),
      (eA[(eA.LAST_VALUE = 2)] = "LAST_VALUE"),
      (eA[(eA.HISTOGRAM = 3)] = "HISTOGRAM"),
      (eA[(eA.EXPONENTIAL_HISTOGRAM = 4)] = "EXPONENTIAL_HISTOGRAM"));
  })(eh || (eh = {}));
  var tc = (function () {
      function DropAggregator() {
        this.kind = eh.DROP;
      }
      return (
        (DropAggregator.prototype.createAccumulation = function () {}),
        (DropAggregator.prototype.merge = function (eA, el) {}),
        (DropAggregator.prototype.diff = function (eA, el) {}),
        (DropAggregator.prototype.toMetricData = function (eA, el, ec, eu) {}),
        DropAggregator
      );
    })(),
    Sum_read = function (eA, el) {
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
    tu = (function () {
      function SumAccumulation(eA, el, ec, eu) {
        (void 0 === ec && (ec = 0),
          void 0 === eu && (eu = !1),
          (this.startTime = eA),
          (this.monotonic = el),
          (this._current = ec),
          (this.reset = eu));
      }
      return (
        (SumAccumulation.prototype.record = function (eA) {
          (this.monotonic && eA < 0) || (this._current += eA);
        }),
        (SumAccumulation.prototype.setStartTime = function (eA) {
          this.startTime = eA;
        }),
        (SumAccumulation.prototype.toPointValue = function () {
          return this._current;
        }),
        SumAccumulation
      );
    })(),
    td = (function () {
      function SumAggregator(eA) {
        ((this.monotonic = eA), (this.kind = eh.SUM));
      }
      return (
        (SumAggregator.prototype.createAccumulation = function (eA) {
          return new tu(eA, this.monotonic);
        }),
        (SumAggregator.prototype.merge = function (eA, el) {
          var ec = eA.toPointValue(),
            eu = el.toPointValue();
          return el.reset
            ? new tu(el.startTime, this.monotonic, eu, el.reset)
            : new tu(eA.startTime, this.monotonic, ec + eu);
        }),
        (SumAggregator.prototype.diff = function (eA, el) {
          var ec = eA.toPointValue(),
            eu = el.toPointValue();
          return this.monotonic && ec > eu
            ? new tu(el.startTime, this.monotonic, eu, !0)
            : new tu(el.startTime, this.monotonic, eu - ec);
        }),
        (SumAggregator.prototype.toMetricData = function (eA, el, ec, eu) {
          return {
            descriptor: eA,
            aggregationTemporality: el,
            dataPointType: ed.SUM,
            dataPoints: ec.map(function (eA) {
              var el = Sum_read(eA, 2),
                ec = el[0],
                ed = el[1];
              return {
                attributes: ec,
                startTime: ed.startTime,
                endTime: eu,
                value: ed.toPointValue(),
              };
            }),
            isMonotonic: this.monotonic,
          };
        }),
        SumAggregator
      );
    })(),
    LastValue_read = function (eA, el) {
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
    tp = (function () {
      function LastValueAccumulation(eA, el, ec) {
        (void 0 === el && (el = 0),
          void 0 === ec && (ec = [0, 0]),
          (this.startTime = eA),
          (this._current = el),
          (this.sampleTime = ec));
      }
      return (
        (LastValueAccumulation.prototype.record = function (eA) {
          ((this._current = eA),
            (this.sampleTime = (0, e1.millisToHrTime)(Date.now())));
        }),
        (LastValueAccumulation.prototype.setStartTime = function (eA) {
          this.startTime = eA;
        }),
        (LastValueAccumulation.prototype.toPointValue = function () {
          return this._current;
        }),
        LastValueAccumulation
      );
    })(),
    tg = (function () {
      function LastValueAggregator() {
        this.kind = eh.LAST_VALUE;
      }
      return (
        (LastValueAggregator.prototype.createAccumulation = function (eA) {
          return new tp(eA);
        }),
        (LastValueAggregator.prototype.merge = function (eA, el) {
          var ec =
            (0, e1.hrTimeToMicroseconds)(el.sampleTime) >=
            (0, e1.hrTimeToMicroseconds)(eA.sampleTime)
              ? el
              : eA;
          return new tp(eA.startTime, ec.toPointValue(), ec.sampleTime);
        }),
        (LastValueAggregator.prototype.diff = function (eA, el) {
          var ec =
            (0, e1.hrTimeToMicroseconds)(el.sampleTime) >=
            (0, e1.hrTimeToMicroseconds)(eA.sampleTime)
              ? el
              : eA;
          return new tp(el.startTime, ec.toPointValue(), ec.sampleTime);
        }),
        (LastValueAggregator.prototype.toMetricData = function (
          eA,
          el,
          ec,
          eu,
        ) {
          return {
            descriptor: eA,
            aggregationTemporality: el,
            dataPointType: ed.GAUGE,
            dataPoints: ec.map(function (eA) {
              var el = LastValue_read(eA, 2),
                ec = el[0],
                ed = el[1];
              return {
                attributes: ec,
                startTime: ed.startTime,
                endTime: eu,
                value: ed.toPointValue(),
              };
            }),
          };
        }),
        LastValueAggregator
      );
    })(),
    Histogram_read = function (eA, el) {
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
  function createNewEmptyCheckpoint(eA) {
    var el = eA.map(function () {
      return 0;
    });
    return (
      el.push(0),
      {
        buckets: { boundaries: eA, counts: el },
        sum: 0,
        count: 0,
        hasMinMax: !1,
        min: 1 / 0,
        max: -1 / 0,
      }
    );
  }
  var tf = (function () {
      function HistogramAccumulation(eA, el, ec, eu) {
        (void 0 === ec && (ec = !0),
          void 0 === eu && (eu = createNewEmptyCheckpoint(el)),
          (this.startTime = eA),
          (this._boundaries = el),
          (this._recordMinMax = ec),
          (this._current = eu));
      }
      return (
        (HistogramAccumulation.prototype.record = function (eA) {
          if (!Number.isNaN(eA)) {
            ((this._current.count += 1),
              (this._current.sum += eA),
              this._recordMinMax &&
                ((this._current.min = Math.min(eA, this._current.min)),
                (this._current.max = Math.max(eA, this._current.max)),
                (this._current.hasMinMax = !0)));
            var el = binarySearchUB(this._boundaries, eA);
            this._current.buckets.counts[el] += 1;
          }
        }),
        (HistogramAccumulation.prototype.setStartTime = function (eA) {
          this.startTime = eA;
        }),
        (HistogramAccumulation.prototype.toPointValue = function () {
          return this._current;
        }),
        HistogramAccumulation
      );
    })(),
    tm = (function () {
      function HistogramAggregator(eA, el) {
        ((this._boundaries = eA),
          (this._recordMinMax = el),
          (this.kind = eh.HISTOGRAM));
      }
      return (
        (HistogramAggregator.prototype.createAccumulation = function (eA) {
          return new tf(eA, this._boundaries, this._recordMinMax);
        }),
        (HistogramAggregator.prototype.merge = function (eA, el) {
          for (
            var ec = eA.toPointValue(),
              eu = el.toPointValue(),
              ed = ec.buckets.counts,
              ep = eu.buckets.counts,
              eg = Array(ed.length),
              eh = 0;
            eh < ed.length;
            eh++
          )
            eg[eh] = ed[eh] + ep[eh];
          var ef = 1 / 0,
            em = -1 / 0;
          return (
            this._recordMinMax &&
              (ec.hasMinMax && eu.hasMinMax
                ? ((ef = Math.min(ec.min, eu.min)),
                  (em = Math.max(ec.max, eu.max)))
                : ec.hasMinMax
                  ? ((ef = ec.min), (em = ec.max))
                  : eu.hasMinMax && ((ef = eu.min), (em = eu.max))),
            new tf(eA.startTime, ec.buckets.boundaries, this._recordMinMax, {
              buckets: { boundaries: ec.buckets.boundaries, counts: eg },
              count: ec.count + eu.count,
              sum: ec.sum + eu.sum,
              hasMinMax: this._recordMinMax && (ec.hasMinMax || eu.hasMinMax),
              min: ef,
              max: em,
            })
          );
        }),
        (HistogramAggregator.prototype.diff = function (eA, el) {
          for (
            var ec = eA.toPointValue(),
              eu = el.toPointValue(),
              ed = ec.buckets.counts,
              ep = eu.buckets.counts,
              eg = Array(ed.length),
              eh = 0;
            eh < ed.length;
            eh++
          )
            eg[eh] = ep[eh] - ed[eh];
          return new tf(
            el.startTime,
            ec.buckets.boundaries,
            this._recordMinMax,
            {
              buckets: { boundaries: ec.buckets.boundaries, counts: eg },
              count: eu.count - ec.count,
              sum: eu.sum - ec.sum,
              hasMinMax: !1,
              min: 1 / 0,
              max: -1 / 0,
            },
          );
        }),
        (HistogramAggregator.prototype.toMetricData = function (
          eA,
          el,
          ec,
          eu,
        ) {
          return {
            descriptor: eA,
            aggregationTemporality: el,
            dataPointType: ed.HISTOGRAM,
            dataPoints: ec.map(function (el) {
              var ec = Histogram_read(el, 2),
                ed = ec[0],
                ep = ec[1],
                eh = ep.toPointValue(),
                ef =
                  eA.type === eg.GAUGE ||
                  eA.type === eg.UP_DOWN_COUNTER ||
                  eA.type === eg.OBSERVABLE_GAUGE ||
                  eA.type === eg.OBSERVABLE_UP_DOWN_COUNTER;
              return {
                attributes: ed,
                startTime: ep.startTime,
                endTime: eu,
                value: {
                  min: eh.hasMinMax ? eh.min : void 0,
                  max: eh.hasMinMax ? eh.max : void 0,
                  sum: ef ? void 0 : eh.sum,
                  buckets: eh.buckets,
                  count: eh.count,
                },
              };
            }),
          };
        }),
        HistogramAggregator
      );
    })(),
    Buckets_read = function (eA, el) {
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
    Buckets_spreadArray = function (eA, el, ec) {
      if (ec || 2 == arguments.length)
        for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
          (!eu && ed in el) ||
            (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
            (eu[ed] = el[ed]));
      return eA.concat(eu || Array.prototype.slice.call(el));
    },
    tE = (function () {
      function Buckets(eA, el, ec, eu) {
        (void 0 === eA && (eA = new tC()),
          void 0 === el && (el = 0),
          void 0 === ec && (ec = 0),
          void 0 === eu && (eu = 0),
          (this.backing = eA),
          (this.indexBase = el),
          (this.indexStart = ec),
          (this.indexEnd = eu));
      }
      return (
        Object.defineProperty(Buckets.prototype, "offset", {
          get: function () {
            return this.indexStart;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(Buckets.prototype, "length", {
          get: function () {
            return 0 === this.backing.length ||
              (this.indexEnd === this.indexStart && 0 === this.at(0))
              ? 0
              : this.indexEnd - this.indexStart + 1;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (Buckets.prototype.counts = function () {
          var eA = this;
          return Array.from({ length: this.length }, function (el, ec) {
            return eA.at(ec);
          });
        }),
        (Buckets.prototype.at = function (eA) {
          var el = this.indexBase - this.indexStart;
          return (
            eA < el && (eA += this.backing.length),
            (eA -= el),
            this.backing.countAt(eA)
          );
        }),
        (Buckets.prototype.incrementBucket = function (eA, el) {
          this.backing.increment(eA, el);
        }),
        (Buckets.prototype.decrementBucket = function (eA, el) {
          this.backing.decrement(eA, el);
        }),
        (Buckets.prototype.trim = function () {
          for (var eA = 0; eA < this.length; eA++)
            if (0 !== this.at(eA)) {
              this.indexStart += eA;
              break;
            } else if (eA === this.length - 1) {
              this.indexStart = this.indexEnd = this.indexBase = 0;
              return;
            }
          for (var eA = this.length - 1; eA >= 0; eA--)
            if (0 !== this.at(eA)) {
              this.indexEnd -= this.length - eA - 1;
              break;
            }
          this._rotate();
        }),
        (Buckets.prototype.downscale = function (eA) {
          this._rotate();
          for (
            var el = 1 + this.indexEnd - this.indexStart,
              ec = 1 << eA,
              eu = 0,
              ed = 0,
              ep = this.indexStart;
            ep <= this.indexEnd;

          ) {
            var eg = ep % ec;
            eg < 0 && (eg += ec);
            for (var eh = eg; eh < ec && eu < el; eh++)
              (this._relocateBucket(ed, eu), eu++, ep++);
            ed++;
          }
          ((this.indexStart >>= eA),
            (this.indexEnd >>= eA),
            (this.indexBase = this.indexStart));
        }),
        (Buckets.prototype.clone = function () {
          return new Buckets(
            this.backing.clone(),
            this.indexBase,
            this.indexStart,
            this.indexEnd,
          );
        }),
        (Buckets.prototype._rotate = function () {
          var eA = this.indexBase - this.indexStart;
          0 !== eA &&
            (eA > 0
              ? (this.backing.reverse(0, this.backing.length),
                this.backing.reverse(0, eA),
                this.backing.reverse(eA, this.backing.length))
              : (this.backing.reverse(0, this.backing.length),
                this.backing.reverse(0, this.backing.length + eA)),
            (this.indexBase = this.indexStart));
        }),
        (Buckets.prototype._relocateBucket = function (eA, el) {
          eA !== el && this.incrementBucket(eA, this.backing.emptyBucket(el));
        }),
        Buckets
      );
    })(),
    tC = (function () {
      function BucketsBacking(eA) {
        (void 0 === eA && (eA = [0]), (this._counts = eA));
      }
      return (
        Object.defineProperty(BucketsBacking.prototype, "length", {
          get: function () {
            return this._counts.length;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (BucketsBacking.prototype.countAt = function (eA) {
          return this._counts[eA];
        }),
        (BucketsBacking.prototype.growTo = function (eA, el, ec) {
          var eu = Array(eA).fill(0);
          (eu.splice.apply(
            eu,
            Buckets_spreadArray(
              [ec, this._counts.length - el],
              Buckets_read(this._counts.slice(el)),
              !1,
            ),
          ),
            eu.splice.apply(
              eu,
              Buckets_spreadArray(
                [0, el],
                Buckets_read(this._counts.slice(0, el)),
                !1,
              ),
            ),
            (this._counts = eu));
        }),
        (BucketsBacking.prototype.reverse = function (eA, el) {
          for (var ec = Math.floor((eA + el) / 2) - eA, eu = 0; eu < ec; eu++) {
            var ed = this._counts[eA + eu];
            ((this._counts[eA + eu] = this._counts[el - eu - 1]),
              (this._counts[el - eu - 1] = ed));
          }
        }),
        (BucketsBacking.prototype.emptyBucket = function (eA) {
          var el = this._counts[eA];
          return ((this._counts[eA] = 0), el);
        }),
        (BucketsBacking.prototype.increment = function (eA, el) {
          this._counts[eA] += el;
        }),
        (BucketsBacking.prototype.decrement = function (eA, el) {
          this._counts[eA] >= el
            ? (this._counts[eA] -= el)
            : (this._counts[eA] = 0);
        }),
        (BucketsBacking.prototype.clone = function () {
          return new BucketsBacking(
            Buckets_spreadArray([], Buckets_read(this._counts), !1),
          );
        }),
        BucketsBacking
      );
    })(),
    ty = 52,
    tw = 0x7ff00000,
    tB = 1048575,
    t_ = 1023,
    tI = -1022,
    tv = 1023,
    tS = 22250738585072014e-324;
  function getNormalBase2(eA) {
    var el = new DataView(new ArrayBuffer(8));
    return (el.setFloat64(0, eA), ((el.getUint32(0) & tw) >> 20) - t_);
  }
  function getSignificand(eA) {
    var el = new DataView(new ArrayBuffer(8));
    return (
      el.setFloat64(0, eA),
      (el.getUint32(0) & tB) * 0x100000000 + el.getUint32(4)
    );
  }
  function ldexp(eA, el) {
    return 0 === eA || eA === 1 / 0 || eA === -1 / 0 || Number.isNaN(eA)
      ? eA
      : eA * Math.pow(2, el);
  }
  function nextGreaterSquare(eA) {
    return (
      eA--,
      (eA |= eA >> 1),
      (eA |= eA >> 2),
      (eA |= eA >> 4),
      (eA |= eA >> 8),
      (eA |= eA >> 16),
      ++eA
    );
  }
  var tQ = (function () {
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
    tD = (function (eA) {
      function MappingError() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (tQ(MappingError, eA), MappingError);
    })(Error),
    tT = (function () {
      function ExponentMapping(eA) {
        this._shift = -eA;
      }
      return (
        (ExponentMapping.prototype.mapToIndex = function (eA) {
          return eA < tS
            ? this._minNormalLowerBoundaryIndex()
            : (getNormalBase2(eA) +
                this._rightShift(getSignificand(eA) - 1, ty)) >>
                this._shift;
        }),
        (ExponentMapping.prototype.lowerBoundary = function (eA) {
          var el = this._minNormalLowerBoundaryIndex();
          if (eA < el)
            throw new tD(
              "underflow: " + eA + " is < minimum lower boundary: " + el,
            );
          var ec = this._maxNormalLowerBoundaryIndex();
          if (eA > ec)
            throw new tD(
              "overflow: " + eA + " is > maximum lower boundary: " + ec,
            );
          return ldexp(1, eA << this._shift);
        }),
        Object.defineProperty(ExponentMapping.prototype, "scale", {
          get: function () {
            return 0 === this._shift ? 0 : -this._shift;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (ExponentMapping.prototype._minNormalLowerBoundaryIndex = function () {
          var eA = tI >> this._shift;
          return (this._shift < 2 && eA--, eA);
        }),
        (ExponentMapping.prototype._maxNormalLowerBoundaryIndex = function () {
          return tv >> this._shift;
        }),
        (ExponentMapping.prototype._rightShift = function (eA, el) {
          return Math.floor(eA * Math.pow(2, -el));
        }),
        ExponentMapping
      );
    })(),
    tR = (function () {
      function LogarithmMapping(eA) {
        ((this._scale = eA),
          (this._scaleFactor = ldexp(Math.LOG2E, eA)),
          (this._inverseFactor = ldexp(Math.LN2, -eA)));
      }
      return (
        (LogarithmMapping.prototype.mapToIndex = function (eA) {
          if (eA <= tS) return this._minNormalLowerBoundaryIndex() - 1;
          if (0 === getSignificand(eA))
            return (getNormalBase2(eA) << this._scale) - 1;
          var el = Math.floor(Math.log(eA) * this._scaleFactor),
            ec = this._maxNormalLowerBoundaryIndex();
          return el >= ec ? ec : el;
        }),
        (LogarithmMapping.prototype.lowerBoundary = function (eA) {
          var el = this._maxNormalLowerBoundaryIndex();
          if (eA >= el) {
            if (eA === el)
              return (
                2 * Math.exp((eA - (1 << this._scale)) / this._scaleFactor)
              );
            throw new tD(
              "overflow: " + eA + " is > maximum lower boundary: " + el,
            );
          }
          var ec = this._minNormalLowerBoundaryIndex();
          if (eA <= ec) {
            if (eA === ec) return tS;
            if (eA === ec - 1)
              return (
                Math.exp((eA + (1 << this._scale)) / this._scaleFactor) / 2
              );
            throw new tD(
              "overflow: " + eA + " is < minimum lower boundary: " + ec,
            );
          }
          return Math.exp(eA * this._inverseFactor);
        }),
        Object.defineProperty(LogarithmMapping.prototype, "scale", {
          get: function () {
            return this._scale;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (LogarithmMapping.prototype._minNormalLowerBoundaryIndex = function () {
          return tI << this._scale;
        }),
        (LogarithmMapping.prototype._maxNormalLowerBoundaryIndex = function () {
          return ((tv + 1) << this._scale) - 1;
        }),
        LogarithmMapping
      );
    })(),
    tk = -10,
    tM = 20,
    tx = Array.from({ length: 31 }, function (eA, el) {
      return el > 10 ? new tR(el - 10) : new tT(el - 10);
    });
  function getMapping(eA) {
    if (eA > tM || eA < tk)
      throw new tD("expected scale >= " + tk + " && <= " + tM + ", got: " + eA);
    return tx[eA + 10];
  }
  var ExponentialHistogram_read = function (eA, el) {
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
    tO = (function () {
      function HighLow(eA, el) {
        ((this.low = eA), (this.high = el));
      }
      return (
        (HighLow.combine = function (eA, el) {
          return new HighLow(
            Math.min(eA.low, el.low),
            Math.max(eA.high, el.high),
          );
        }),
        HighLow
      );
    })(),
    tN = 20,
    tP = 160,
    tL = 2,
    tF = (function () {
      function ExponentialHistogramAccumulation(
        eA,
        el,
        ec,
        eu,
        ed,
        ep,
        eg,
        eh,
        ef,
        em,
        eE,
      ) {
        (void 0 === el && (el = tP),
          void 0 === ec && (ec = !0),
          void 0 === eu && (eu = 0),
          void 0 === ed && (ed = 0),
          void 0 === ep && (ep = 0),
          void 0 === eg && (eg = 1 / 0),
          void 0 === eh && (eh = -1 / 0),
          void 0 === ef && (ef = new tE()),
          void 0 === em && (em = new tE()),
          void 0 === eE && (eE = getMapping(tN)),
          (this.startTime = eA),
          (this._maxSize = el),
          (this._recordMinMax = ec),
          (this._sum = eu),
          (this._count = ed),
          (this._zeroCount = ep),
          (this._min = eg),
          (this._max = eh),
          (this._positive = ef),
          (this._negative = em),
          (this._mapping = eE),
          this._maxSize < tL &&
            (eZ.diag.warn(
              "Exponential Histogram Max Size set to " +
                this._maxSize +
                ",                 changing to the minimum size of: " +
                tL,
            ),
            (this._maxSize = tL)));
      }
      return (
        (ExponentialHistogramAccumulation.prototype.record = function (eA) {
          this.updateByIncrement(eA, 1);
        }),
        (ExponentialHistogramAccumulation.prototype.setStartTime = function (
          eA,
        ) {
          this.startTime = eA;
        }),
        (ExponentialHistogramAccumulation.prototype.toPointValue = function () {
          return {
            hasMinMax: this._recordMinMax,
            min: this.min,
            max: this.max,
            sum: this.sum,
            positive: {
              offset: this.positive.offset,
              bucketCounts: this.positive.counts(),
            },
            negative: {
              offset: this.negative.offset,
              bucketCounts: this.negative.counts(),
            },
            count: this.count,
            scale: this.scale,
            zeroCount: this.zeroCount,
          };
        }),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "sum",
          {
            get: function () {
              return this._sum;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "min",
          {
            get: function () {
              return this._min;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "max",
          {
            get: function () {
              return this._max;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "count",
          {
            get: function () {
              return this._count;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "zeroCount",
          {
            get: function () {
              return this._zeroCount;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "scale",
          {
            get: function () {
              return this._count === this._zeroCount ? 0 : this._mapping.scale;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "positive",
          {
            get: function () {
              return this._positive;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        Object.defineProperty(
          ExponentialHistogramAccumulation.prototype,
          "negative",
          {
            get: function () {
              return this._negative;
            },
            enumerable: !1,
            configurable: !0,
          },
        ),
        (ExponentialHistogramAccumulation.prototype.updateByIncrement =
          function (eA, el) {
            if (!Number.isNaN(eA)) {
              if (
                (eA > this._max && (this._max = eA),
                eA < this._min && (this._min = eA),
                (this._count += el),
                0 === eA)
              ) {
                this._zeroCount += el;
                return;
              }
              ((this._sum += eA * el),
                eA > 0
                  ? this._updateBuckets(this._positive, eA, el)
                  : this._updateBuckets(this._negative, -eA, el));
            }
          }),
        (ExponentialHistogramAccumulation.prototype.merge = function (eA) {
          (0 === this._count
            ? ((this._min = eA.min), (this._max = eA.max))
            : 0 !== eA.count &&
              (eA.min < this.min && (this._min = eA.min),
              eA.max > this.max && (this._max = eA.max)),
            (this.startTime = eA.startTime),
            (this._sum += eA.sum),
            (this._count += eA.count),
            (this._zeroCount += eA.zeroCount));
          var el = this._minScale(eA);
          (this._downscale(this.scale - el),
            this._mergeBuckets(this.positive, eA, eA.positive, el),
            this._mergeBuckets(this.negative, eA, eA.negative, el));
        }),
        (ExponentialHistogramAccumulation.prototype.diff = function (eA) {
          ((this._min = 1 / 0),
            (this._max = -1 / 0),
            (this._sum -= eA.sum),
            (this._count -= eA.count),
            (this._zeroCount -= eA.zeroCount));
          var el = this._minScale(eA);
          (this._downscale(this.scale - el),
            this._diffBuckets(this.positive, eA, eA.positive, el),
            this._diffBuckets(this.negative, eA, eA.negative, el));
        }),
        (ExponentialHistogramAccumulation.prototype.clone = function () {
          return new ExponentialHistogramAccumulation(
            this.startTime,
            this._maxSize,
            this._recordMinMax,
            this._sum,
            this._count,
            this._zeroCount,
            this._min,
            this._max,
            this.positive.clone(),
            this.negative.clone(),
            this._mapping,
          );
        }),
        (ExponentialHistogramAccumulation.prototype._updateBuckets = function (
          eA,
          el,
          ec,
        ) {
          var eu = this._mapping.mapToIndex(el),
            ed = !1,
            ep = 0,
            eg = 0;
          if (
            (0 === eA.length
              ? ((eA.indexStart = eu),
                (eA.indexEnd = eA.indexStart),
                (eA.indexBase = eA.indexStart))
              : eu < eA.indexStart && eA.indexEnd - eu >= this._maxSize
                ? ((ed = !0), (eg = eu), (ep = eA.indexEnd))
                : eu > eA.indexEnd &&
                  eu - eA.indexStart >= this._maxSize &&
                  ((ed = !0), (eg = eA.indexStart), (ep = eu)),
            ed)
          ) {
            var eh = this._changeScale(ep, eg);
            (this._downscale(eh), (eu = this._mapping.mapToIndex(el)));
          }
          this._incrementIndexBy(eA, eu, ec);
        }),
        (ExponentialHistogramAccumulation.prototype._incrementIndexBy =
          function (eA, el, ec) {
            if (0 !== ec) {
              if (
                (0 === eA.length &&
                  (eA.indexStart = eA.indexEnd = eA.indexBase = el),
                el < eA.indexStart)
              ) {
                var eu = eA.indexEnd - el;
                (eu >= eA.backing.length && this._grow(eA, eu + 1),
                  (eA.indexStart = el));
              } else if (el > eA.indexEnd) {
                var eu = el - eA.indexStart;
                (eu >= eA.backing.length && this._grow(eA, eu + 1),
                  (eA.indexEnd = el));
              }
              var ed = el - eA.indexBase;
              (ed < 0 && (ed += eA.backing.length), eA.incrementBucket(ed, ec));
            }
          }),
        (ExponentialHistogramAccumulation.prototype._grow = function (eA, el) {
          var ec = eA.backing.length,
            eu = eA.indexBase - eA.indexStart,
            ed = ec - eu,
            ep = nextGreaterSquare(el);
          ep > this._maxSize && (ep = this._maxSize);
          var eg = ep - eu;
          eA.backing.growTo(ep, ed, eg);
        }),
        (ExponentialHistogramAccumulation.prototype._changeScale = function (
          eA,
          el,
        ) {
          for (var ec = 0; eA - el >= this._maxSize; )
            ((eA >>= 1), (el >>= 1), ec++);
          return ec;
        }),
        (ExponentialHistogramAccumulation.prototype._downscale = function (eA) {
          if (0 !== eA) {
            if (eA < 0)
              throw Error("impossible change of scale: " + this.scale);
            var el = this._mapping.scale - eA;
            (this._positive.downscale(eA),
              this._negative.downscale(eA),
              (this._mapping = getMapping(el)));
          }
        }),
        (ExponentialHistogramAccumulation.prototype._minScale = function (eA) {
          var el = Math.min(this.scale, eA.scale),
            ec = tO.combine(
              this._highLowAtScale(this.positive, this.scale, el),
              this._highLowAtScale(eA.positive, eA.scale, el),
            ),
            eu = tO.combine(
              this._highLowAtScale(this.negative, this.scale, el),
              this._highLowAtScale(eA.negative, eA.scale, el),
            );
          return Math.min(
            el - this._changeScale(ec.high, ec.low),
            el - this._changeScale(eu.high, eu.low),
          );
        }),
        (ExponentialHistogramAccumulation.prototype._highLowAtScale = function (
          eA,
          el,
          ec,
        ) {
          if (0 === eA.length) return new tO(0, -1);
          var eu = el - ec;
          return new tO(eA.indexStart >> eu, eA.indexEnd >> eu);
        }),
        (ExponentialHistogramAccumulation.prototype._mergeBuckets = function (
          eA,
          el,
          ec,
          eu,
        ) {
          for (
            var ed = ec.offset, ep = el.scale - eu, eg = 0;
            eg < ec.length;
            eg++
          )
            this._incrementIndexBy(eA, (ed + eg) >> ep, ec.at(eg));
        }),
        (ExponentialHistogramAccumulation.prototype._diffBuckets = function (
          eA,
          el,
          ec,
          eu,
        ) {
          for (
            var ed = ec.offset, ep = el.scale - eu, eg = 0;
            eg < ec.length;
            eg++
          ) {
            var eh = ((ed + eg) >> ep) - eA.indexBase;
            (eh < 0 && (eh += eA.backing.length),
              eA.decrementBucket(eh, ec.at(eg)));
          }
          eA.trim();
        }),
        ExponentialHistogramAccumulation
      );
    })(),
    tU = (function () {
      function ExponentialHistogramAggregator(eA, el) {
        ((this._maxSize = eA),
          (this._recordMinMax = el),
          (this.kind = eh.EXPONENTIAL_HISTOGRAM));
      }
      return (
        (ExponentialHistogramAggregator.prototype.createAccumulation =
          function (eA) {
            return new tF(eA, this._maxSize, this._recordMinMax);
          }),
        (ExponentialHistogramAggregator.prototype.merge = function (eA, el) {
          var ec = el.clone();
          return (ec.merge(eA), ec);
        }),
        (ExponentialHistogramAggregator.prototype.diff = function (eA, el) {
          var ec = el.clone();
          return (ec.diff(eA), ec);
        }),
        (ExponentialHistogramAggregator.prototype.toMetricData = function (
          eA,
          el,
          ec,
          eu,
        ) {
          return {
            descriptor: eA,
            aggregationTemporality: el,
            dataPointType: ed.EXPONENTIAL_HISTOGRAM,
            dataPoints: ec.map(function (el) {
              var ec = ExponentialHistogram_read(el, 2),
                ed = ec[0],
                ep = ec[1],
                eh = ep.toPointValue(),
                ef =
                  eA.type === eg.GAUGE ||
                  eA.type === eg.UP_DOWN_COUNTER ||
                  eA.type === eg.OBSERVABLE_GAUGE ||
                  eA.type === eg.OBSERVABLE_UP_DOWN_COUNTER;
              return {
                attributes: ed,
                startTime: ep.startTime,
                endTime: eu,
                value: {
                  min: eh.hasMinMax ? eh.min : void 0,
                  max: eh.hasMinMax ? eh.max : void 0,
                  sum: ef ? void 0 : eh.sum,
                  positive: {
                    offset: eh.positive.offset,
                    bucketCounts: eh.positive.bucketCounts,
                  },
                  negative: {
                    offset: eh.negative.offset,
                    bucketCounts: eh.negative.bucketCounts,
                  },
                  count: eh.count,
                  scale: eh.scale,
                  zeroCount: eh.zeroCount,
                },
              };
            }),
          };
        }),
        ExponentialHistogramAggregator
      );
    })(),
    tj = (function () {
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
    tG = (function () {
      function Aggregation() {}
      return (
        (Aggregation.Drop = function () {
          return tW;
        }),
        (Aggregation.Sum = function () {
          return tV;
        }),
        (Aggregation.LastValue = function () {
          return tZ;
        }),
        (Aggregation.Histogram = function () {
          return tX;
        }),
        (Aggregation.ExponentialHistogram = function () {
          return t0;
        }),
        (Aggregation.Default = function () {
          return t1;
        }),
        Aggregation
      );
    })(),
    tH = (function (eA) {
      function DropAggregation() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        tj(DropAggregation, eA),
        (DropAggregation.prototype.createAggregator = function (eA) {
          return DropAggregation.DEFAULT_INSTANCE;
        }),
        (DropAggregation.DEFAULT_INSTANCE = new tc()),
        DropAggregation
      );
    })(tG),
    tK = (function (eA) {
      function SumAggregation() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        tj(SumAggregation, eA),
        (SumAggregation.prototype.createAggregator = function (eA) {
          switch (eA.type) {
            case eg.COUNTER:
            case eg.OBSERVABLE_COUNTER:
            case eg.HISTOGRAM:
              return SumAggregation.MONOTONIC_INSTANCE;
            default:
              return SumAggregation.NON_MONOTONIC_INSTANCE;
          }
        }),
        (SumAggregation.MONOTONIC_INSTANCE = new td(!0)),
        (SumAggregation.NON_MONOTONIC_INSTANCE = new td(!1)),
        SumAggregation
      );
    })(tG),
    t$ = (function (eA) {
      function LastValueAggregation() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        tj(LastValueAggregation, eA),
        (LastValueAggregation.prototype.createAggregator = function (eA) {
          return LastValueAggregation.DEFAULT_INSTANCE;
        }),
        (LastValueAggregation.DEFAULT_INSTANCE = new tg()),
        LastValueAggregation
      );
    })(tG),
    tY = (function (eA) {
      function HistogramAggregation() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        tj(HistogramAggregation, eA),
        (HistogramAggregation.prototype.createAggregator = function (eA) {
          return HistogramAggregation.DEFAULT_INSTANCE;
        }),
        (HistogramAggregation.DEFAULT_INSTANCE = new tm(
          [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1e3, 2500, 5e3, 7500, 1e4],
          !0,
        )),
        HistogramAggregation
      );
    })(tG),
    tJ = (function (eA) {
      function ExplicitBucketHistogramAggregation(el, ec) {
        void 0 === ec && (ec = !0);
        var eu = eA.call(this) || this;
        if (((eu._recordMinMax = ec), null == el))
          throw Error(
            "ExplicitBucketHistogramAggregation should be created with explicit boundaries, if a single bucket histogram is required, please pass an empty array",
          );
        var ed = (el = (el = el.concat()).sort(function (eA, el) {
            return eA - el;
          })).lastIndexOf(-1 / 0),
          ep = el.indexOf(1 / 0);
        return (
          -1 === ep && (ep = void 0),
          (eu._boundaries = el.slice(ed + 1, ep)),
          eu
        );
      }
      return (
        tj(ExplicitBucketHistogramAggregation, eA),
        (ExplicitBucketHistogramAggregation.prototype.createAggregator =
          function (eA) {
            return new tm(this._boundaries, this._recordMinMax);
          }),
        ExplicitBucketHistogramAggregation
      );
    })(tG),
    tq = (function (eA) {
      function ExponentialHistogramAggregation(el, ec) {
        (void 0 === el && (el = 160), void 0 === ec && (ec = !0));
        var eu = eA.call(this) || this;
        return ((eu._maxSize = el), (eu._recordMinMax = ec), eu);
      }
      return (
        tj(ExponentialHistogramAggregation, eA),
        (ExponentialHistogramAggregation.prototype.createAggregator = function (
          eA,
        ) {
          return new tU(this._maxSize, this._recordMinMax);
        }),
        ExponentialHistogramAggregation
      );
    })(tG),
    tz = (function (eA) {
      function DefaultAggregation() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        tj(DefaultAggregation, eA),
        (DefaultAggregation.prototype._resolve = function (eA) {
          switch (eA.type) {
            case eg.COUNTER:
            case eg.UP_DOWN_COUNTER:
            case eg.OBSERVABLE_COUNTER:
            case eg.OBSERVABLE_UP_DOWN_COUNTER:
              return tV;
            case eg.GAUGE:
            case eg.OBSERVABLE_GAUGE:
              return tZ;
            case eg.HISTOGRAM:
              if (eA.advice.explicitBucketBoundaries)
                return new tJ(eA.advice.explicitBucketBoundaries);
              return tX;
          }
          return (
            eZ.diag.warn("Unable to recognize instrument type: " + eA.type),
            tW
          );
        }),
        (DefaultAggregation.prototype.createAggregator = function (eA) {
          return this._resolve(eA).createAggregator(eA);
        }),
        DefaultAggregation
      );
    })(tG),
    tW = new tH(),
    tV = new tK(),
    tZ = new t$(),
    tX = new tY(),
    t0 = new tq(),
    t1 = new tz();
  !(function (eA) {
    ((eA[(eA.DELTA = 0)] = "DELTA"),
      (eA[(eA.CUMULATIVE = 1)] = "CUMULATIVE"),
      (eA[(eA.LOWMEMORY = 2)] = "LOWMEMORY"));
  })(ef || (ef = {}));
  var t2 = (function () {
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
    CumulativeTemporalitySelector = function () {
      return ep.CUMULATIVE;
    },
    DeltaTemporalitySelector = function (eA) {
      switch (eA) {
        case eg.COUNTER:
        case eg.OBSERVABLE_COUNTER:
        case eg.GAUGE:
        case eg.HISTOGRAM:
        case eg.OBSERVABLE_GAUGE:
          return ep.DELTA;
        case eg.UP_DOWN_COUNTER:
        case eg.OBSERVABLE_UP_DOWN_COUNTER:
          return ep.CUMULATIVE;
      }
    },
    LowMemoryTemporalitySelector = function (eA) {
      switch (eA) {
        case eg.COUNTER:
        case eg.HISTOGRAM:
          return ep.DELTA;
        case eg.GAUGE:
        case eg.UP_DOWN_COUNTER:
        case eg.OBSERVABLE_UP_DOWN_COUNTER:
        case eg.OBSERVABLE_COUNTER:
        case eg.OBSERVABLE_GAUGE:
          return ep.CUMULATIVE;
      }
    };
  function chooseTemporalitySelectorFromEnvironment() {
    var eA = (0, e9.getEnv)(),
      el =
        eA.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE.trim().toLowerCase();
    return "cumulative" === el
      ? CumulativeTemporalitySelector
      : "delta" === el
        ? DeltaTemporalitySelector
        : "lowmemory" === el
          ? LowMemoryTemporalitySelector
          : (eZ.diag.warn(
              "OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE is set to '" +
                eA.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE +
                "', but only 'cumulative' and 'delta' are allowed. Using default ('cumulative') instead.",
            ),
            CumulativeTemporalitySelector);
  }
  function chooseTemporalitySelector(eA) {
    return null != eA
      ? eA === ef.DELTA
        ? DeltaTemporalitySelector
        : eA === ef.LOWMEMORY
          ? LowMemoryTemporalitySelector
          : CumulativeTemporalitySelector
      : chooseTemporalitySelectorFromEnvironment();
  }
  function chooseAggregationSelector(eA) {
    return (null == eA ? void 0 : eA.aggregationPreference)
      ? eA.aggregationPreference
      : function (eA) {
          return tG.Default();
        };
  }
  var t3 = (function (eA) {
      function OTLPMetricExporterBase(el, ec) {
        var eu = eA.call(this, el) || this;
        return (
          (eu._aggregationSelector = chooseAggregationSelector(ec)),
          (eu._aggregationTemporalitySelector = chooseTemporalitySelector(
            null == ec ? void 0 : ec.temporalityPreference,
          )),
          eu
        );
      }
      return (
        t2(OTLPMetricExporterBase, eA),
        (OTLPMetricExporterBase.prototype.selectAggregation = function (eA) {
          return this._aggregationSelector(eA);
        }),
        (OTLPMetricExporterBase.prototype.selectAggregationTemporality =
          function (eA) {
            return this._aggregationTemporalitySelector(eA);
          }),
        OTLPMetricExporterBase
      );
    })(eY),
    t4 = ec(54601);
  let Ac = { "User-Agent": `Galileo-Node-SDK/${eG.SDK_VERSION}` },
    Au = ["otlp.j.woa.com", "gocp.woa.com", "gotp.woa.com"],
    Ad = 5e3,
    Ap = 5,
    Ag = 1e3,
    Ah = 5e3,
    Af = 1.5,
    Am = 0.2;
  let GalileoEncryptedMetricExporter = class GalileoEncryptedMetricExporter extends t3 {
    constructor(eA = {}, el) {
      const ec = createHttpOptions(eA, "METRICS", "v1/metrics");
      super(
        createOtlpNetworkExportDelegate(
          ec,
          e5,
          new GalileoEncryptedOtlpHttpTransport(ec, el),
        ),
        eA,
      );
    }
  };
  function createHttpOptions(eA, el, ec) {
    return convertLegacyHttpOptions(eA, el, ec, {
      ...Ac,
      "Content-Type": "application/json",
    });
  }
  return {
    GalileoEncryptedMetricExporter,
    Aggregation: tG,
    SumAggregation: tK,
    ExplicitBucketHistogramAggregation: tJ,
    ExponentialHistogramAggregation: tq,
    InstrumentType: eg,
    AggregationTemporality: ep,
    TemporalityPreference: ef,
    createInstrumentDescriptor,
    readerHelpers: { FlatMap, callWithTimeout, TimeoutError: tn },
    meterHelpers: {
      hashAttributes,
      isDescriptorCompatibleWith,
      PromiseAllSettled,
      isPromiseAllSettledRejectionResult,
      callWithTimeout,
      setEquals,
      isNotNullish,
      createInstrumentDescriptorWithView,
      instrumentationScopeId,
    },
  };
}

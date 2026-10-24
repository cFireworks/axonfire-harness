// @ts-nocheck
// Captured OTLP JSON serializers and their time, hex and value type helpers.
export const OTLP_SERIALIZERS_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const OTLP_SERIALIZERS_REGIONS = [
  [7928002, 7928330],
  [7928330, 7928430],
  [7928430, 7928510],
  [7928510, 7928607],
  [7928607, 7928670],
  [7928670, 7929090],
  [7929090, 7929120],
  [7929120, 7929204],
  [7929204, 7929317],
  [7929317, 7929384],
  [7929384, 7929448],
  [7929448, 7929511],
  [7929511, 7929543],
  [7929543, 7929620],
  [7929620, 7929738],
  [7929738, 7930009],
  [7930009, 7930667],
  [7930667, 7931416],
  [7931416, 7931728],
  [7931728, 7931927],
  [7931927, 7932047],
  [7932047, 7932541],
  [7932541, 7933110],
  [7933110, 7933354],
  [7933354, 7933524],
  [7933524, 7933737],
  [7933737, 7934374],
  [7934374, 7934663],
  [7934663, 7934798],
  [7934798, 7935144],
  [7935144, 7935621],
  [7935621, 7935722],
  [7935722, 7935850],
  [7935850, 7936089],
  [7936089, 7936987],
  [7936987, 7937103],
  [7937103, 7937616],
  [7937616, 7938073],
  [7938073, 7938629],
  [7938629, 7938669],
  [7938669, 7938769],
  [7938769, 7942041],
] as const;
export const OTLP_SERIALIZERS_MODULES = [
  [41437, 1003003, 1004894],
  [77047, 1002657, 1003002],
  [11447, 979538, 979682],
] as const;
export function createNativeOtlpSerializers(runtime: any) {
  const factories = {
      41437(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            addHrTimes: () => addHrTimes,
            getTimeOrigin: () => getTimeOrigin,
            hrTime: () => hrTime,
            hrTimeDuration: () => hrTimeDuration,
            hrTimeToMicroseconds: () => hrTimeToMicroseconds,
            hrTimeToMilliseconds: () => hrTimeToMilliseconds,
            hrTimeToNanoseconds: () => hrTimeToNanoseconds,
            hrTimeToTimeStamp: () => hrTimeToTimeStamp,
            isTimeInput: () => isTimeInput,
            isTimeInputHrTime: () => isTimeInputHrTime,
            millisToHrTime: () => millisToHrTime,
            timeInputToHrTime: () => timeInputToHrTime,
          }));
        var eu = ec(32047),
          ed = 9,
          ep = 1e6,
          eg = 1e9;
        function millisToHrTime(eA) {
          return [Math.trunc(eA / 1e3), Math.round((eA % 1e3) * ep)];
        }
        function getTimeOrigin() {
          var eA = eu.otperformance.timeOrigin;
          if ("number" != typeof eA) {
            var el = eu.otperformance;
            eA = el.timing && el.timing.fetchStart;
          }
          return eA;
        }
        function hrTime(eA) {
          return addHrTimes(
            millisToHrTime(getTimeOrigin()),
            millisToHrTime("number" == typeof eA ? eA : eu.otperformance.now()),
          );
        }
        function timeInputToHrTime(eA) {
          if (isTimeInputHrTime(eA)) return eA;
          if ("number" == typeof eA)
            if (eA < getTimeOrigin()) return hrTime(eA);
            else return millisToHrTime(eA);
          if (eA instanceof Date) return millisToHrTime(eA.getTime());
          throw TypeError("Invalid input type");
        }
        function hrTimeDuration(eA, el) {
          var ec = el[0] - eA[0],
            eu = el[1] - eA[1];
          return (eu < 0 && ((ec -= 1), (eu += eg)), [ec, eu]);
        }
        function hrTimeToTimeStamp(eA) {
          var el = ed,
            ec = "" + "0".repeat(el) + eA[1] + "Z",
            eu = ec.substring(ec.length - el - 1);
          return new Date(1e3 * eA[0]).toISOString().replace("000Z", eu);
        }
        function hrTimeToNanoseconds(eA) {
          return eA[0] * eg + eA[1];
        }
        function hrTimeToMilliseconds(eA) {
          return 1e3 * eA[0] + eA[1] / 1e6;
        }
        function hrTimeToMicroseconds(eA) {
          return 1e6 * eA[0] + eA[1] / 1e3;
        }
        function isTimeInputHrTime(eA) {
          return (
            Array.isArray(eA) &&
            2 === eA.length &&
            "number" == typeof eA[0] &&
            "number" == typeof eA[1]
          );
        }
        function isTimeInput(eA) {
          return (
            isTimeInputHrTime(eA) || "number" == typeof eA || eA instanceof Date
          );
        }
        function addHrTimes(eA, el) {
          var ec = [eA[0] + el[0], eA[1] + el[1]];
          return (ec[1] >= eg && ((ec[1] -= eg), (ec[0] += 1)), ec);
        }
      },
      77047(eA, el, ec) {
        "use strict";
        function intValue(eA) {
          return eA >= 48 && eA <= 57
            ? eA - 48
            : eA >= 97 && eA <= 102
              ? eA - 87
              : eA - 55;
        }
        function hexToBinary(eA) {
          for (
            var el = new Uint8Array(eA.length / 2), ec = 0, eu = 0;
            eu < eA.length;
            eu += 2
          ) {
            var ed = intValue(eA.charCodeAt(eu)),
              ep = intValue(eA.charCodeAt(eu + 1));
            el[ec++] = (ed << 4) | ep;
          }
          return el;
        }
        (ec.r(el), ec.d(el, { hexToBinary: () => hexToBinary }));
      },
      11447(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { ValueType: () => eu }),
          (function (eA) {
            ((eA[(eA.INT = 0)] = "INT"), (eA[(eA.DOUBLE = 1)] = "DOUBLE"));
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
      throw Error("Explicit OTLP parent required: " + id);
    return value;
  }
  ec.r = (o: any) => Object.defineProperty(o, "__esModule", { value: true });
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  const eR = ec(11447);
  let ed, ep;
  var internal_read = function (eA, el) {
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
  function createResource(eA) {
    return {
      attributes: toAttributes(eA.attributes),
      droppedAttributesCount: 0,
    };
  }
  function createInstrumentationScope(eA) {
    return { name: eA.name, version: eA.version };
  }
  function toAttributes(eA) {
    return Object.keys(eA).map(function (el) {
      return toKeyValue(el, eA[el]);
    });
  }
  function toKeyValue(eA, el) {
    return { key: eA, value: toAnyValue(el) };
  }
  function toAnyValue(eA) {
    var el = typeof eA;
    return "string" === el
      ? { stringValue: eA }
      : "number" === el
        ? Number.isInteger(eA)
          ? { intValue: eA }
          : { doubleValue: eA }
        : "boolean" === el
          ? { boolValue: eA }
          : eA instanceof Uint8Array
            ? { bytesValue: eA }
            : Array.isArray(eA)
              ? { arrayValue: { values: eA.map(toAnyValue) } }
              : "object" === el && null != eA
                ? {
                    kvlistValue: {
                      values: Object.entries(eA).map(function (eA) {
                        var el = internal_read(eA, 2);
                        return toKeyValue(el[0], el[1]);
                      }),
                    },
                  }
                : {};
  }
  var e1 = ec(41437),
    e2 = ec(77047);
  function hrTimeToNanos(eA) {
    var el = BigInt(1e9);
    return BigInt(eA[0]) * el + BigInt(eA[1]);
  }
  function toLongBits(eA) {
    return {
      low: Number(BigInt.asUintN(32, eA)),
      high: Number(BigInt.asUintN(32, eA >> BigInt(32))),
    };
  }
  function encodeAsLongBits(eA) {
    return toLongBits(hrTimeToNanos(eA));
  }
  function encodeAsString(eA) {
    return hrTimeToNanos(eA).toString();
  }
  var e3 = "u" > typeof BigInt ? encodeAsString : e1.hrTimeToNanoseconds;
  function identity(eA) {
    return eA;
  }
  function optionalHexToBinary(eA) {
    if (void 0 !== eA) return (0, e2.hexToBinary)(eA);
  }
  var e4 = {
    encodeHrTime: encodeAsLongBits,
    encodeSpanContext: e2.hexToBinary,
    encodeOptionalSpanContext: optionalHexToBinary,
  };
  function getOtlpEncoder(eA) {
    if (void 0 === eA) return e4;
    var el,
      ec,
      eu = null == (el = eA.useLongBits) || el,
      ed = null != (ec = eA.useHex) && ec;
    return {
      encodeHrTime: eu ? encodeAsLongBits : e3,
      encodeSpanContext: ed ? identity : e2.hexToBinary,
      encodeOptionalSpanContext: ed ? identity : optionalHexToBinary,
    };
  }
  var __values = function (eA) {
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
    trace_internal_read = function (eA, el) {
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
  function sdkSpanToOtlpSpan(eA, el) {
    var ec,
      eu = eA.spanContext(),
      ed = eA.status;
    return {
      traceId: el.encodeSpanContext(eu.traceId),
      spanId: el.encodeSpanContext(eu.spanId),
      parentSpanId: el.encodeOptionalSpanContext(eA.parentSpanId),
      traceState: null == (ec = eu.traceState) ? void 0 : ec.serialize(),
      name: eA.name,
      kind: null == eA.kind ? 0 : eA.kind + 1,
      startTimeUnixNano: el.encodeHrTime(eA.startTime),
      endTimeUnixNano: el.encodeHrTime(eA.endTime),
      attributes: toAttributes(eA.attributes),
      droppedAttributesCount: eA.droppedAttributesCount,
      events: eA.events.map(function (eA) {
        return toOtlpSpanEvent(eA, el);
      }),
      droppedEventsCount: eA.droppedEventsCount,
      status: { code: ed.code, message: ed.message },
      links: eA.links.map(function (eA) {
        return toOtlpLink(eA, el);
      }),
      droppedLinksCount: eA.droppedLinksCount,
    };
  }
  function toOtlpLink(eA, el) {
    var ec;
    return {
      attributes: eA.attributes ? toAttributes(eA.attributes) : [],
      spanId: el.encodeSpanContext(eA.context.spanId),
      traceId: el.encodeSpanContext(eA.context.traceId),
      traceState:
        null == (ec = eA.context.traceState) ? void 0 : ec.serialize(),
      droppedAttributesCount: eA.droppedAttributesCount || 0,
    };
  }
  function toOtlpSpanEvent(eA, el) {
    return {
      attributes: eA.attributes ? toAttributes(eA.attributes) : [],
      name: eA.name,
      timeUnixNano: el.encodeHrTime(eA.time),
      droppedAttributesCount: eA.droppedAttributesCount || 0,
    };
  }
  function createExportTraceServiceRequest(eA, el) {
    return {
      resourceSpans: spanRecordsToResourceSpans(eA, getOtlpEncoder(el)),
    };
  }
  function createResourceMap(eA) {
    var el,
      ec,
      eu = new Map();
    try {
      for (var ed = __values(eA), ep = ed.next(); !ep.done; ep = ed.next()) {
        var eg = ep.value,
          eh = eu.get(eg.resource);
        eh || ((eh = new Map()), eu.set(eg.resource, eh));
        var ef =
            eg.instrumentationLibrary.name +
            "@" +
            (eg.instrumentationLibrary.version || "") +
            ":" +
            (eg.instrumentationLibrary.schemaUrl || ""),
          em = eh.get(ef);
        (em || ((em = []), eh.set(ef, em)), em.push(eg));
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
  }
  function spanRecordsToResourceSpans(eA, el) {
    for (
      var ec = createResourceMap(eA),
        eu = [],
        ed = ec.entries(),
        ep = ed.next();
      !ep.done;

    ) {
      for (
        var eg = trace_internal_read(ep.value, 2),
          eh = eg[0],
          ef = eg[1],
          em = [],
          eE = ef.values(),
          eC = eE.next();
        !eC.done;

      ) {
        var ey = eC.value;
        if (ey.length > 0) {
          var ew = ey.map(function (eA) {
            return sdkSpanToOtlpSpan(eA, el);
          });
          em.push({
            scope: createInstrumentationScope(ey[0].instrumentationLibrary),
            spans: ew,
            schemaUrl: ey[0].instrumentationLibrary.schemaUrl,
          });
        }
        eC = eE.next();
      }
      var eB = {
        resource: createResource(eh),
        scopeSpans: em,
        schemaUrl: void 0,
      };
      (eu.push(eB), (ep = ed.next()));
    }
    return eu;
  }
  var e8 = {
    serializeRequest: function (eA) {
      var el = createExportTraceServiceRequest(eA, {
        useHex: !0,
        useLongBits: !1,
      });
      return new TextEncoder().encode(JSON.stringify(el));
    },
    deserializeResponse: function (eA) {
      return JSON.parse(new TextDecoder().decode(eA));
    },
  };
  function toResourceMetrics(eA, el) {
    var ec = getOtlpEncoder(el);
    return {
      resource: createResource(eA.resource),
      schemaUrl: void 0,
      scopeMetrics: toScopeMetrics(eA.scopeMetrics, ec),
    };
  }
  function toScopeMetrics(eA, el) {
    return Array.from(
      eA.map(function (eA) {
        return {
          scope: createInstrumentationScope(eA.scope),
          metrics: eA.metrics.map(function (eA) {
            return toMetric(eA, el);
          }),
          schemaUrl: eA.scope.schemaUrl,
        };
      }),
    );
  }
  function toMetric(eA, el) {
    var ec = {
        name: eA.descriptor.name,
        description: eA.descriptor.description,
        unit: eA.descriptor.unit,
      },
      eu = toAggregationTemporality(eA.aggregationTemporality);
    switch (eA.dataPointType) {
      case ed.SUM:
        ec.sum = {
          aggregationTemporality: eu,
          isMonotonic: eA.isMonotonic,
          dataPoints: toSingularDataPoints(eA, el),
        };
        break;
      case ed.GAUGE:
        ec.gauge = { dataPoints: toSingularDataPoints(eA, el) };
        break;
      case ed.HISTOGRAM:
        ec.histogram = {
          aggregationTemporality: eu,
          dataPoints: toHistogramDataPoints(eA, el),
        };
        break;
      case ed.EXPONENTIAL_HISTOGRAM:
        ec.exponentialHistogram = {
          aggregationTemporality: eu,
          dataPoints: toExponentialHistogramDataPoints(eA, el),
        };
    }
    return ec;
  }
  function toSingularDataPoint(eA, el, ec) {
    var eu = {
      attributes: toAttributes(eA.attributes),
      startTimeUnixNano: ec.encodeHrTime(eA.startTime),
      timeUnixNano: ec.encodeHrTime(eA.endTime),
    };
    switch (el) {
      case eR.ValueType.INT:
        eu.asInt = eA.value;
        break;
      case eR.ValueType.DOUBLE:
        eu.asDouble = eA.value;
    }
    return eu;
  }
  function toSingularDataPoints(eA, el) {
    return eA.dataPoints.map(function (ec) {
      return toSingularDataPoint(ec, eA.descriptor.valueType, el);
    });
  }
  function toHistogramDataPoints(eA, el) {
    return eA.dataPoints.map(function (eA) {
      var ec = eA.value;
      return {
        attributes: toAttributes(eA.attributes),
        bucketCounts: ec.buckets.counts,
        explicitBounds: ec.buckets.boundaries,
        count: ec.count,
        sum: ec.sum,
        min: ec.min,
        max: ec.max,
        startTimeUnixNano: el.encodeHrTime(eA.startTime),
        timeUnixNano: el.encodeHrTime(eA.endTime),
      };
    });
  }
  function toExponentialHistogramDataPoints(eA, el) {
    return eA.dataPoints.map(function (eA) {
      var ec = eA.value;
      return {
        attributes: toAttributes(eA.attributes),
        count: ec.count,
        min: ec.min,
        max: ec.max,
        sum: ec.sum,
        positive: {
          offset: ec.positive.offset,
          bucketCounts: ec.positive.bucketCounts,
        },
        negative: {
          offset: ec.negative.offset,
          bucketCounts: ec.negative.bucketCounts,
        },
        scale: ec.scale,
        zeroCount: ec.zeroCount,
        startTimeUnixNano: el.encodeHrTime(eA.startTime),
        timeUnixNano: el.encodeHrTime(eA.endTime),
      };
    });
  }
  function toAggregationTemporality(eA) {
    switch (eA) {
      case ep.DELTA:
        return 1;
      case ep.CUMULATIVE:
        return 2;
    }
  }
  function createExportMetricsServiceRequest(eA, el) {
    return {
      resourceMetrics: eA.map(function (eA) {
        return toResourceMetrics(eA, el);
      }),
    };
  }
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
  var e5 = {
      serializeRequest: function (eA) {
        var el = createExportMetricsServiceRequest([eA], { useLongBits: !1 });
        return new TextEncoder().encode(JSON.stringify(el));
      },
      deserializeResponse: function (eA) {
        return JSON.parse(new TextDecoder().decode(eA));
      },
    },
    internal_values = function (eA) {
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
    logs_internal_read = function (eA, el) {
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
  function createExportLogsServiceRequest(eA, el) {
    return { resourceLogs: logRecordsToResourceLogs(eA, getOtlpEncoder(el)) };
  }
  function internal_createResourceMap(eA) {
    var el,
      ec,
      eu = new Map();
    try {
      for (
        var ed = internal_values(eA), ep = ed.next();
        !ep.done;
        ep = ed.next()
      ) {
        var eg = ep.value,
          eh = eg.resource,
          ef = eg.instrumentationScope,
          em = ef.name,
          eE = ef.version,
          eC = void 0 === eE ? "" : eE,
          ey = ef.schemaUrl,
          ew = void 0 === ey ? "" : ey,
          eB = eu.get(eh);
        eB || ((eB = new Map()), eu.set(eh, eB));
        var e_ = em + "@" + eC + ":" + ew,
          eI = eB.get(e_);
        (eI || ((eI = []), eB.set(e_, eI)), eI.push(eg));
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
  }
  function logRecordsToResourceLogs(eA, el) {
    return Array.from(internal_createResourceMap(eA), function (eA) {
      var ec = logs_internal_read(eA, 2),
        eu = ec[0],
        ed = ec[1];
      return {
        resource: createResource(eu),
        scopeLogs: Array.from(ed, function (eA) {
          var ec = logs_internal_read(eA, 2)[1];
          return {
            scope: createInstrumentationScope(ec[0].instrumentationScope),
            logRecords: ec.map(function (eA) {
              return toLogRecord(eA, el);
            }),
            schemaUrl: ec[0].instrumentationScope.schemaUrl,
          };
        }),
        schemaUrl: void 0,
      };
    });
  }
  function toLogRecord(eA, el) {
    var ec, eu, ed;
    return {
      timeUnixNano: el.encodeHrTime(eA.hrTime),
      observedTimeUnixNano: el.encodeHrTime(eA.hrTimeObserved),
      severityNumber: toSeverityNumber(eA.severityNumber),
      severityText: eA.severityText,
      body: toAnyValue(eA.body),
      attributes: toLogAttributes(eA.attributes),
      droppedAttributesCount: eA.droppedAttributesCount,
      flags: null == (ec = eA.spanContext) ? void 0 : ec.traceFlags,
      traceId: el.encodeOptionalSpanContext(
        null == (eu = eA.spanContext) ? void 0 : eu.traceId,
      ),
      spanId: el.encodeOptionalSpanContext(
        null == (ed = eA.spanContext) ? void 0 : ed.spanId,
      ),
    };
  }
  function toSeverityNumber(eA) {
    return eA;
  }
  function toLogAttributes(eA) {
    return Object.keys(eA).map(function (el) {
      return toKeyValue(el, eA[el]);
    });
  }
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
  return {
    trace: e8,
    metrics: e5,
    logs: e6,
    createExportTraceServiceRequest,
    createExportMetricsServiceRequest,
    createExportLogsServiceRequest,
    toAnyValue,
    getOtlpEncoder,
    getModule: ec,
  };
}

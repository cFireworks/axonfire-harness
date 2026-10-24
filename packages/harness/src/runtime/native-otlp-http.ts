// @ts-nocheck
// Captured HTTP option conversion and baggage parser factories.
export const OTLP_HTTP_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const OTLP_HTTP_REGIONS = [
  [7921554, 7921753],
  [7921753, 7921835],
  [7921835, 7922231],
  [7922231, 7922338],
  [7922338, 7922659],
  [7922659, 7922966],
  [7922966, 7923208],
  [7923208, 7923384],
  [7923384, 7923551],
  [7923551, 7923959],
  [7923959, 7924159],
  [7924159, 7924176],
  [7924176, 7924471],
  [7924471, 7924663],
  [7924663, 7924921],
  [7924921, 7925133],
  [7925133, 7925266],
  [7925266, 7925560],
  [7925560, 7926022],
  [7926022, 7926231],
  [7926231, 7926623],
  [7926623, 7926798],
  [7926798, 7926981],
  [7926981, 7927304],
  [7927304, 7927562],
  [7927562, 7928002],
] as const;
export const OTLP_HTTP_MODULES = [
  [44874, 998246, 999952],
  [20662, 970273, 972462],
  [3250, 996772, 997112],
] as const;
export function createNativeOtlpHttp(runtime: any) {
  const process = runtime.process,
    eZ = { diag: runtime.diag };
  if (!process || !runtime.diag)
    throw Error("Explicit HTTP env and diagnostics required");
  const factories = {
      44874(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            getKeyPairs: () => getKeyPairs,
            parseKeyPairsIntoRecord: () => parseKeyPairsIntoRecord,
            parsePairKeyValue: () => parsePairKeyValue,
            serializeKeyPairs: () => serializeKeyPairs,
          }));
        var eu = ec(20662),
          ed = ec(3250),
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
        function serializeKeyPairs(eA) {
          return eA.reduce(function (eA, el) {
            var ec =
              "" + eA + ("" !== eA ? ed.BAGGAGE_ITEMS_SEPARATOR : "") + el;
            return ec.length > ed.BAGGAGE_MAX_TOTAL_LENGTH ? eA : ec;
          }, "");
        }
        function getKeyPairs(eA) {
          return eA.getAllEntries().map(function (eA) {
            var el = __read(eA, 2),
              ec = el[0],
              eu = el[1],
              ep = encodeURIComponent(ec) + "=" + encodeURIComponent(eu.value);
            return (
              void 0 !== eu.metadata &&
                (ep +=
                  ed.BAGGAGE_PROPERTIES_SEPARATOR + eu.metadata.toString()),
              ep
            );
          });
        }
        function parsePairKeyValue(eA) {
          var el,
            ec = eA.split(ed.BAGGAGE_PROPERTIES_SEPARATOR);
          if (!(ec.length <= 0)) {
            var ep = ec.shift();
            if (ep) {
              var eg = ep.indexOf(ed.BAGGAGE_KEY_PAIR_SEPARATOR);
              if (!(eg <= 0)) {
                var eh = decodeURIComponent(ep.substring(0, eg).trim()),
                  ef = decodeURIComponent(ep.substring(eg + 1).trim());
                return (
                  ec.length > 0 &&
                    (el = (0, eu.baggageEntryMetadataFromString)(
                      ec.join(ed.BAGGAGE_PROPERTIES_SEPARATOR),
                    )),
                  { key: eh, value: ef, metadata: el }
                );
              }
            }
          }
        }
        function parseKeyPairsIntoRecord(eA) {
          return "string" != typeof eA || 0 === eA.length
            ? {}
            : eA
                .split(ed.BAGGAGE_ITEMS_SEPARATOR)
                .map(function (eA) {
                  return parsePairKeyValue(eA);
                })
                .filter(function (eA) {
                  return void 0 !== eA && eA.value.length > 0;
                })
                .reduce(function (eA, el) {
                  return ((eA[el.key] = el.value), eA);
                }, {});
        }
      },
      20662(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            createBaggage: () => createBaggage,
            baggageEntryMetadataFromString: () =>
              baggageEntryMetadataFromString,
          }));
        var eu = ec(58583),
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
            function BaggageImpl(eA) {
              this._entries = eA ? new Map(eA) : new Map();
            }
            return (
              (BaggageImpl.prototype.getEntry = function (eA) {
                var el = this._entries.get(eA);
                if (el) return Object.assign({}, el);
              }),
              (BaggageImpl.prototype.getAllEntries = function () {
                return Array.from(this._entries.entries()).map(function (eA) {
                  var el = __read(eA, 2);
                  return [el[0], el[1]];
                });
              }),
              (BaggageImpl.prototype.setEntry = function (eA, el) {
                var ec = new BaggageImpl(this._entries);
                return (ec._entries.set(eA, el), ec);
              }),
              (BaggageImpl.prototype.removeEntry = function (eA) {
                var el = new BaggageImpl(this._entries);
                return (el._entries.delete(eA), el);
              }),
              (BaggageImpl.prototype.removeEntries = function () {
                for (var eA, el, ec = [], eu = 0; eu < arguments.length; eu++)
                  ec[eu] = arguments[eu];
                var ed = new BaggageImpl(this._entries);
                try {
                  for (
                    var ep = __values(ec), eg = ep.next();
                    !eg.done;
                    eg = ep.next()
                  ) {
                    var eh = eg.value;
                    ed._entries.delete(eh);
                  }
                } catch (el) {
                  eA = { error: el };
                } finally {
                  try {
                    eg && !eg.done && (el = ep.return) && el.call(ep);
                  } finally {
                    if (eA) throw eA.error;
                  }
                }
                return ed;
              }),
              (BaggageImpl.prototype.clear = function () {
                return new BaggageImpl();
              }),
              BaggageImpl
            );
          })(),
          ep = Symbol("BaggageEntryMetadata"),
          eg = eu.DiagAPI.instance();
        function createBaggage(eA) {
          return (
            void 0 === eA && (eA = {}),
            new ed(new Map(Object.entries(eA)))
          );
        }
        function baggageEntryMetadataFromString(eA) {
          return (
            "string" != typeof eA &&
              (eg.error(
                "Cannot create baggage metadata from unknown type: " +
                  typeof eA,
              ),
              (eA = "")),
            {
              __TYPE__: ep,
              toString: function () {
                return eA;
              },
            }
          );
        }
      },
      3250(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            BAGGAGE_HEADER: () => eg,
            BAGGAGE_ITEMS_SEPARATOR: () => ep,
            BAGGAGE_KEY_PAIR_SEPARATOR: () => eu,
            BAGGAGE_MAX_NAME_VALUE_PAIRS: () => eh,
            BAGGAGE_MAX_PER_NAME_VALUE_PAIRS: () => ef,
            BAGGAGE_MAX_TOTAL_LENGTH: () => em,
            BAGGAGE_PROPERTIES_SEPARATOR: () => ed,
          }));
        var eu = "=",
          ed = ";",
          ep = ",",
          eg = "baggage",
          eh = 180,
          ef = 4096,
          em = 8192;
      },
    },
    cache = new Map();
  function ec(id: number): any {
    if (id === 72912) return { baggageUtils: ec(44874) };
    if (cache.has(id)) return cache.get(id);
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m.exports);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit OTLP HTTP parent required: " + id);
    return value;
  }
  ec.r = (o: any) => Object.defineProperty(o, "__esModule", { value: true });
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  function validateTimeoutMillis(eA) {
    if (!Number.isNaN(eA) && Number.isFinite(eA) && eA > 0) return eA;
    throw Error(
      "Configuration: timeoutMillis is invalid, expected number greater than 0 (actual: '" +
        eA +
        "')",
    );
  }
  function wrapStaticHeadersInFunction(eA) {
    if (null != eA)
      return function () {
        return eA;
      };
  }
  function mergeOtlpSharedConfigurationWithDefaults(eA, el, ec) {
    var eu, ed, ep, eg, eh, ef;
    return {
      timeoutMillis: validateTimeoutMillis(
        null != (ed = null != (eu = eA.timeoutMillis) ? eu : el.timeoutMillis)
          ? ed
          : ec.timeoutMillis,
      ),
      concurrencyLimit:
        null !=
        (eg = null != (ep = eA.concurrencyLimit) ? ep : el.concurrencyLimit)
          ? eg
          : ec.concurrencyLimit,
      compression:
        null != (ef = null != (eh = eA.compression) ? eh : el.compression)
          ? ef
          : ec.compression,
    };
  }
  function getSharedConfigurationDefaults() {
    return { timeoutMillis: 1e4, concurrencyLimit: 30, compression: "none" };
  }
  var __read = function (eA, el) {
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
  function validateAndNormalizeHeaders(eA) {
    return function () {
      var el,
        ec = {};
      return (
        Object.entries(
          null != (el = null == eA ? void 0 : eA()) ? el : {},
        ).forEach(function (eA) {
          var el = __read(eA, 2),
            eu = el[0],
            ed = el[1];
          void 0 !== ed
            ? (ec[eu] = String(ed))
            : eZ.diag.warn(
                'Header "' +
                  eu +
                  '" has invalid value (' +
                  ed +
                  ") and will be ignored",
              );
        }),
        ec
      );
    };
  }
  var __assign = function () {
    return (__assign =
      Object.assign ||
      function (eA) {
        for (var el, ec = 1, eu = arguments.length; ec < eu; ec++)
          for (var ed in (el = arguments[ec]))
            Object.prototype.hasOwnProperty.call(el, ed) && (eA[ed] = el[ed]);
        return eA;
      }).apply(this, arguments);
  };
  function mergeHeaders(eA, el, ec) {
    var eu = __assign({}, ec()),
      ed = {};
    return function () {
      return (
        null != el && Object.assign(ed, el()),
        null != eA && Object.assign(ed, eA()),
        Object.assign(ed, eu)
      );
    };
  }
  function validateUserProvidedUrl(eA) {
    if (null != eA)
      try {
        return (new URL(eA), eA);
      } catch (el) {
        throw Error(
          "Configuration: Could not parse user-provided export URL: '" +
            eA +
            "'",
        );
      }
  }
  function mergeOtlpHttpConfigurationWithDefaults(eA, el, ec) {
    var eu, ed, ep, eg;
    return __assign(
      __assign({}, mergeOtlpSharedConfigurationWithDefaults(eA, el, ec)),
      {
        headers: mergeHeaders(
          validateAndNormalizeHeaders(eA.headers),
          el.headers,
          ec.headers,
        ),
        url:
          null !=
          (ed = null != (eu = validateUserProvidedUrl(eA.url)) ? eu : el.url)
            ? ed
            : ec.url,
        agentOptions:
          null != (eg = null != (ep = eA.agentOptions) ? ep : el.agentOptions)
            ? eg
            : ec.agentOptions,
      },
    );
  }
  function getHttpConfigurationDefaults(eA, el) {
    return __assign(__assign({}, getSharedConfigurationDefaults()), {
      headers: function () {
        return eA;
      },
      url: "http://localhost:4318/" + el,
      agentOptions: { keepAlive: !0 },
    });
  }
  var e0 = ec(72912);
  function parseAndValidateTimeoutFromEnv(eA) {
    var el,
      ec = null == (el = process.env[eA]) ? void 0 : el.trim();
    if (null != ec && "" !== ec) {
      var eu = Number(ec);
      if (!Number.isNaN(eu) && Number.isFinite(eu) && eu > 0) return eu;
      eZ.diag.warn(
        "Configuration: " +
          eA +
          " is invalid, expected number greater than 0 (actual: " +
          ec +
          ")",
      );
    }
  }
  function getTimeoutFromEnv(eA) {
    var el = parseAndValidateTimeoutFromEnv(
        "OTEL_EXPORTER_OTLP_" + eA + "_TIMEOUT",
      ),
      ec = parseAndValidateTimeoutFromEnv("OTEL_EXPORTER_OTLP_TIMEOUT");
    return null != el ? el : ec;
  }
  function parseAndValidateCompressionFromEnv(eA) {
    var el,
      ec = null == (el = process.env[eA]) ? void 0 : el.trim();
    if ("" !== ec) {
      if (null == ec || "none" === ec || "gzip" === ec) return ec;
      eZ.diag.warn(
        "Configuration: " +
          eA +
          " is invalid, expected 'none' or 'gzip' (actual: '" +
          ec +
          "')",
      );
    }
  }
  function getCompressionFromEnv(eA) {
    var el = parseAndValidateCompressionFromEnv(
        "OTEL_EXPORTER_OTLP_" + eA + "_COMPRESSION",
      ),
      ec = parseAndValidateCompressionFromEnv("OTEL_EXPORTER_OTLP_COMPRESSION");
    return null != el ? el : ec;
  }
  function getSharedConfigurationFromEnvironment(eA) {
    return {
      timeoutMillis: getTimeoutFromEnv(eA),
      compression: getCompressionFromEnv(eA),
    };
  }
  var otlp_http_env_configuration_assign = function () {
    return (otlp_http_env_configuration_assign =
      Object.assign ||
      function (eA) {
        for (var el, ec = 1, eu = arguments.length; ec < eu; ec++)
          for (var ed in (el = arguments[ec]))
            Object.prototype.hasOwnProperty.call(el, ed) && (eA[ed] = el[ed]);
        return eA;
      }).apply(this, arguments);
  };
  function getStaticHeadersFromEnv(eA) {
    var el,
      ec,
      eu =
        null == (el = process.env["OTEL_EXPORTER_OTLP_" + eA + "_HEADERS"])
          ? void 0
          : el.trim(),
      ed =
        null == (ec = process.env.OTEL_EXPORTER_OTLP_HEADERS)
          ? void 0
          : ec.trim(),
      ep = e0.baggageUtils.parseKeyPairsIntoRecord(eu),
      eg = e0.baggageUtils.parseKeyPairsIntoRecord(ed);
    if (0 !== Object.keys(ep).length || 0 !== Object.keys(eg).length)
      return Object.assign(
        {},
        e0.baggageUtils.parseKeyPairsIntoRecord(ed),
        e0.baggageUtils.parseKeyPairsIntoRecord(eu),
      );
  }
  function appendRootPathToUrlIfNeeded(eA) {
    try {
      return new URL(eA).toString();
    } catch (el) {
      eZ.diag.warn(
        "Configuration: Could not parse environment-provided export URL: '" +
          eA +
          "', falling back to undefined",
      );
      return;
    }
  }
  function appendResourcePathToUrl(eA, el) {
    try {
      new URL(eA);
    } catch (el) {
      eZ.diag.warn(
        "Configuration: Could not parse environment-provided export URL: '" +
          eA +
          "', falling back to undefined",
      );
      return;
    }
    (eA.endsWith("/") || (eA += "/"), (eA += el));
    try {
      new URL(eA);
    } catch (ec) {
      eZ.diag.warn(
        "Configuration: Provided URL appended with '" +
          el +
          "' is not a valid URL, using 'undefined' instead of '" +
          eA +
          "'",
      );
      return;
    }
    return eA;
  }
  function getNonSpecificUrlFromEnv(eA) {
    var el,
      ec =
        null == (el = process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
          ? void 0
          : el.trim();
    if (null != ec && "" !== ec) return appendResourcePathToUrl(ec, eA);
  }
  function getSpecificUrlFromEnv(eA) {
    var el,
      ec =
        null == (el = process.env["OTEL_EXPORTER_OTLP_" + eA + "_ENDPOINT"])
          ? void 0
          : el.trim();
    if (null != ec && "" !== ec) return appendRootPathToUrlIfNeeded(ec);
  }
  function getHttpConfigurationFromEnvironment(eA, el) {
    var ec;
    return otlp_http_env_configuration_assign(
      otlp_http_env_configuration_assign(
        {},
        getSharedConfigurationFromEnvironment(eA),
      ),
      {
        url:
          null != (ec = getSpecificUrlFromEnv(eA))
            ? ec
            : getNonSpecificUrlFromEnv(el),
        headers: wrapStaticHeadersInFunction(getStaticHeadersFromEnv(eA)),
      },
    );
  }
  function convertLegacyAgentOptions(eA) {
    return (
      (null == eA ? void 0 : eA.keepAlive) != null &&
        (null != eA.httpAgentOptions
          ? null == eA.httpAgentOptions.keepAlive &&
            (eA.httpAgentOptions.keepAlive = eA.keepAlive)
          : (eA.httpAgentOptions = { keepAlive: eA.keepAlive })),
      eA.httpAgentOptions
    );
  }
  function convertLegacyHttpOptions(eA, el, ec, eu) {
    return (
      eA.metadata && eZ.diag.warn("Metadata cannot be set when using http"),
      mergeOtlpHttpConfigurationWithDefaults(
        {
          url: eA.url,
          headers: wrapStaticHeadersInFunction(eA.headers),
          concurrencyLimit: eA.concurrencyLimit,
          timeoutMillis: eA.timeoutMillis,
          compression: eA.compression,
          agentOptions: convertLegacyAgentOptions(eA),
        },
        getHttpConfigurationFromEnvironment(el, ec),
        getHttpConfigurationDefaults(eu, ec),
      )
    );
  }
  return {
    convertLegacyHttpOptions,
    convertLegacyAgentOptions,
    mergeOtlpHttpConfigurationWithDefaults,
    getHttpConfigurationDefaults,
    getHttpConfigurationFromEnvironment,
    mergeHeaders,
    validateAndNormalizeHeaders,
    getModule: ec,
  };
}

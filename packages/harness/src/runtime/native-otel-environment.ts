// @ts-nocheck
// Complete captured environment parser and enum factories; explicit process only.
export const OTEL_ENVIRONMENT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const OTEL_ENVIRONMENT_MODULES = [
  [70000, 1008278, 1008598],
  [55733, 1016230, 1021567],
  [79232, 973235, 973501],
  [6023, 1024325, 1024665],
] as const;
export function createNativeOtelEnvironment(runtime: any) {
  if (!runtime?.process?.env)
    throw Error("Explicit OpenTelemetry process environment required");
  const process = runtime.process;
  const factories = {
      7e4(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            getEnv: () => getEnv,
            getEnvWithoutDefaults: () => getEnvWithoutDefaults,
          }));
        var eu = ec(55733);
        function getEnv() {
          var eA = (0, eu.parseEnvironment)(process.env);
          return Object.assign({}, eu.DEFAULT_ENVIRONMENT, eA);
        }
        function getEnvWithoutDefaults() {
          return (0, eu.parseEnvironment)(process.env);
        }
      },
      55733(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            DEFAULT_ATTRIBUTE_COUNT_LIMIT: () => eE,
            DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT: () => em,
            DEFAULT_ENVIRONMENT: () => ew,
            DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: () => eC,
            DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: () => ey,
            parseEnvironment: () => parseEnvironment,
          }));
        var eu = ec(79232),
          ed = ec(6023),
          ep = ",",
          eg = ["OTEL_SDK_DISABLED"];
        function isEnvVarABoolean(eA) {
          return eg.indexOf(eA) > -1;
        }
        var eh = [
          "OTEL_BSP_EXPORT_TIMEOUT",
          "OTEL_BSP_MAX_EXPORT_BATCH_SIZE",
          "OTEL_BSP_MAX_QUEUE_SIZE",
          "OTEL_BSP_SCHEDULE_DELAY",
          "OTEL_BLRP_EXPORT_TIMEOUT",
          "OTEL_BLRP_MAX_EXPORT_BATCH_SIZE",
          "OTEL_BLRP_MAX_QUEUE_SIZE",
          "OTEL_BLRP_SCHEDULE_DELAY",
          "OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT",
          "OTEL_ATTRIBUTE_COUNT_LIMIT",
          "OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT",
          "OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT",
          "OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT",
          "OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT",
          "OTEL_SPAN_EVENT_COUNT_LIMIT",
          "OTEL_SPAN_LINK_COUNT_LIMIT",
          "OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT",
          "OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT",
          "OTEL_EXPORTER_OTLP_TIMEOUT",
          "OTEL_EXPORTER_OTLP_TRACES_TIMEOUT",
          "OTEL_EXPORTER_OTLP_METRICS_TIMEOUT",
          "OTEL_EXPORTER_OTLP_LOGS_TIMEOUT",
          "OTEL_EXPORTER_JAEGER_AGENT_PORT",
        ];
        function isEnvVarANumber(eA) {
          return eh.indexOf(eA) > -1;
        }
        var ef = [
          "OTEL_NO_PATCH_MODULES",
          "OTEL_PROPAGATORS",
          "OTEL_SEMCONV_STABILITY_OPT_IN",
        ];
        function isEnvVarAList(eA) {
          return ef.indexOf(eA) > -1;
        }
        var em = 1 / 0,
          eE = 128,
          eC = 128,
          ey = 128,
          ew = {
            OTEL_SDK_DISABLED: !1,
            CONTAINER_NAME: "",
            ECS_CONTAINER_METADATA_URI_V4: "",
            ECS_CONTAINER_METADATA_URI: "",
            HOSTNAME: "",
            KUBERNETES_SERVICE_HOST: "",
            NAMESPACE: "",
            OTEL_BSP_EXPORT_TIMEOUT: 3e4,
            OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
            OTEL_BSP_MAX_QUEUE_SIZE: 2048,
            OTEL_BSP_SCHEDULE_DELAY: 5e3,
            OTEL_BLRP_EXPORT_TIMEOUT: 3e4,
            OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
            OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
            OTEL_BLRP_SCHEDULE_DELAY: 5e3,
            OTEL_EXPORTER_JAEGER_AGENT_HOST: "",
            OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
            OTEL_EXPORTER_JAEGER_ENDPOINT: "",
            OTEL_EXPORTER_JAEGER_PASSWORD: "",
            OTEL_EXPORTER_JAEGER_USER: "",
            OTEL_EXPORTER_OTLP_ENDPOINT: "",
            OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "",
            OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: "",
            OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
            OTEL_EXPORTER_OTLP_HEADERS: "",
            OTEL_EXPORTER_OTLP_TRACES_HEADERS: "",
            OTEL_EXPORTER_OTLP_METRICS_HEADERS: "",
            OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
            OTEL_EXPORTER_OTLP_TIMEOUT: 1e4,
            OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 1e4,
            OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 1e4,
            OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 1e4,
            OTEL_EXPORTER_ZIPKIN_ENDPOINT: "http://localhost:9411/api/v2/spans",
            OTEL_LOG_LEVEL: eu.DiagLogLevel.INFO,
            OTEL_NO_PATCH_MODULES: [],
            OTEL_PROPAGATORS: ["tracecontext", "baggage"],
            OTEL_RESOURCE_ATTRIBUTES: "",
            OTEL_SERVICE_NAME: "",
            OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: em,
            OTEL_ATTRIBUTE_COUNT_LIMIT: eE,
            OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: em,
            OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: eE,
            OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: em,
            OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: eE,
            OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
            OTEL_SPAN_LINK_COUNT_LIMIT: 128,
            OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: eC,
            OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: ey,
            OTEL_TRACES_EXPORTER: "",
            OTEL_TRACES_SAMPLER: ed.TracesSamplerValues.ParentBasedAlwaysOn,
            OTEL_TRACES_SAMPLER_ARG: "",
            OTEL_LOGS_EXPORTER: "",
            OTEL_EXPORTER_OTLP_INSECURE: "",
            OTEL_EXPORTER_OTLP_TRACES_INSECURE: "",
            OTEL_EXPORTER_OTLP_METRICS_INSECURE: "",
            OTEL_EXPORTER_OTLP_LOGS_INSECURE: "",
            OTEL_EXPORTER_OTLP_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_COMPRESSION: "",
            OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "",
            OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: "",
            OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: "",
            OTEL_EXPORTER_OTLP_CLIENT_KEY: "",
            OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: "",
            OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: "",
            OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: "",
            OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: "",
            OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
            OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: "http/protobuf",
            OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: "http/protobuf",
            OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: "http/protobuf",
            OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: "cumulative",
            OTEL_SEMCONV_STABILITY_OPT_IN: [],
          };
        function parseBoolean(eA, el, ec) {
          if (void 0 !== ec[eA]) {
            var eu = String(ec[eA]);
            el[eA] = "true" === eu.toLowerCase();
          }
        }
        function parseNumber(eA, el, ec, eu, ed) {
          if (
            (void 0 === eu && (eu = -1 / 0),
            void 0 === ed && (ed = 1 / 0),
            void 0 !== ec[eA])
          ) {
            var ep = Number(ec[eA]);
            isNaN(ep) ||
              (ep < eu
                ? (el[eA] = eu)
                : ep > ed
                  ? (el[eA] = ed)
                  : (el[eA] = ep));
          }
        }
        function parseStringList(eA, el, ec, eu) {
          void 0 === eu && (eu = ep);
          var ed = ec[eA];
          "string" == typeof ed &&
            (el[eA] = ed.split(eu).map(function (eA) {
              return eA.trim();
            }));
        }
        var eB = {
          ALL: eu.DiagLogLevel.ALL,
          VERBOSE: eu.DiagLogLevel.VERBOSE,
          DEBUG: eu.DiagLogLevel.DEBUG,
          INFO: eu.DiagLogLevel.INFO,
          WARN: eu.DiagLogLevel.WARN,
          ERROR: eu.DiagLogLevel.ERROR,
          NONE: eu.DiagLogLevel.NONE,
        };
        function setLogLevelFromEnv(eA, el, ec) {
          var eu = ec[eA];
          if ("string" == typeof eu) {
            var ed = eB[eu.toUpperCase()];
            null != ed && (el[eA] = ed);
          }
        }
        function parseEnvironment(eA) {
          var el = {};
          for (var ec in ew) {
            var eu = ec;
            if ("OTEL_LOG_LEVEL" === eu) setLogLevelFromEnv(eu, el, eA);
            else if (isEnvVarABoolean(eu)) parseBoolean(eu, el, eA);
            else if (isEnvVarANumber(eu)) parseNumber(eu, el, eA);
            else if (isEnvVarAList(eu)) parseStringList(eu, el, eA);
            else {
              var ed = eA[eu];
              null != ed && (el[eu] = String(ed));
            }
          }
          return el;
        }
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
      6023(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { TracesSamplerValues: () => eu }),
          (function (eA) {
            ((eA.AlwaysOff = "always_off"),
              (eA.AlwaysOn = "always_on"),
              (eA.ParentBasedAlwaysOff = "parentbased_always_off"),
              (eA.ParentBasedAlwaysOn = "parentbased_always_on"),
              (eA.ParentBasedTraceIdRatio = "parentbased_traceidratio"),
              (eA.TraceIdRatio = "traceidratio"));
          })(eu || (eu = {})));
      },
    },
    cache = new Map();
  function getModule(id: number): any {
    if (cache.has(id)) return cache.get(id);
    if (!factories[id])
      throw Error("Unknown OpenTelemetry environment module: " + id);
    const m = { exports: {} };
    cache.set(id, m.exports);
    factories[id](m, m.exports, getModule);
    return m.exports;
  }
  getModule.r = (o: any) =>
    Object.defineProperty(o, "__esModule", { value: true });
  getModule.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  return {
    ...getModule(70000),
    ...getModule(55733),
    ...getModule(79232),
    ...getModule(6023),
    getModule,
  };
}

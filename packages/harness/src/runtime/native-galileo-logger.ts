// @ts-nocheck
// Original outer Galileo logger. Self-monitor provider creation remains an explicit parent.
export const GALILEO_LOGGER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_LOGGER_REGIONS = [
  {
    kind: "declarator",
    name: "stringifyHandler",
    start: 8053613,
    end: 8053875,
  },
  { kind: "declarator", name: "stringifyPlus", start: 8053876, end: 8054215 },
  {
    kind: "declarator",
    name: "isCurrentRequestSampled",
    start: 8054514,
    end: 8054692,
  },
  { kind: "statement", name: "parseLevel", start: 8079334, end: 8079489 },
  { kind: "statement", name: "levels", start: 8079489, end: 8079738 },
  { kind: "statement", name: "logger_Logger", start: 8079738, end: 8083813 },
] as const;
export function createNativeGalileoLogger(runtime: any) {
  const eM = runtime.resources,
    ex = runtime.enums,
    eG = runtime.sdk,
    AP = runtime.context,
    eD = { trace: runtime.providers.trace },
    rc = runtime.providers.getModule(14138),
    rg = { SeverityNumber: runtime.providers.SeverityNumber },
    eR = runtime.valueTypes,
    rD = runtime.providers.LoggerProvider,
    rk = runtime.providers.BatchLogRecordProcessor,
    rM = runtime.providers.ConsoleLogRecordExporter,
    GalileoEncryptedLogExporter = runtime.exporters.GalileoEncryptedLogExporter,
    resolveGalileoEncryptionConfig = runtime.resolveGalileoEncryptionConfig,
    getSelfMeterProvider = runtime.getSelfMeterProvider,
    process = runtime.process,
    console = runtime.console;
  let em, eE;
  let stringifyHandler = function () {
    let eA = new WeakSet();
    return function (el, ec) {
      if (ec instanceof Error)
        return `Error.message: ${ec.message} 
  Error.stack: ${ec.stack}`;
      if ("object" == typeof ec && null !== ec) {
        if (eA.has(ec)) return `[Circular ${el || "root"}]`;
        eA.add(ec);
      }
      return ec;
    };
  };
  let stringifyPlus = function (eA) {
    if ("string" == typeof eA) return eA;
    try {
      if (eA instanceof Error)
        return (JSON.stringify(eA, stringifyHandler()) || "undefined").replace(
          /"/gim,
          "",
        );
      return JSON.stringify(eA, stringifyHandler()) || "undefined";
    } catch (eA) {
      return `error happen when aegis stringify: 
 ${null == eA ? void 0 : eA.message} 
 ${null == eA ? void 0 : eA.stack}`;
    }
  };
  let isCurrentRequestSampled = () => {
    var eA;
    let el = eD.trace.getSpan(AP.context.active());
    return (
      (null == (eA = null == el ? void 0 : el.spanContext())
        ? void 0
        : eA.traceFlags) === rc.TraceFlags.SAMPLED
    );
  };
  function parseLevel(eA) {
    if (!eA) return em.trace;
    if ("string" == typeof eA) {
      let el = eA.toLowerCase();
      return Object.values(em).includes(el) ? el : em.trace;
    }
    return eA;
  }
  (!(function (eA) {
    ((eA.trace = "trace"),
      (eA.debug = "debug"),
      (eA.info = "info"),
      (eA.warn = "warn"),
      (eA.error = "error"));
  })(em || (em = {})),
    (function (eA) {
      ((eA[(eA.trace = 1)] = "trace"),
        (eA[(eA.debug = 5)] = "debug"),
        (eA[(eA.info = 9)] = "info"),
        (eA[(eA.warn = 13)] = "warn"),
        (eA[(eA.error = 17)] = "error"));
    })(eE || (eE = {})));
  let logger_Logger = class logger_Logger {
    constructor(eA) {
      var el;
      this.getResource = (eA) => {
        let { platform: el, serverName: ec } = this;
        return new eM.Resource({
          [ex.GalileoResourceAttributes.Target]: `${el}.${ec}`,
          [ex.GalileoResourceAttributes.Namespace]: eA,
          [ex.GalileoTraceResourceAttributes.SERVICE_NAME]: `${ec}`,
          [ex.GalileoTraceResourceAttributes.SDK_NAME]: ex.SDKNameValue,
          [ex.GalileoTraceResourceAttributes.LANGUAGE]:
            ex.LanguageValues.Nodejs,
          [ex.GalileoTraceResourceAttributes.SDK_VERSION]: eG.SDK_VERSION,
        });
      };
      const {
          env: ec = ex.EnvNameValues.Test,
          namespace: eu,
          app: ed,
          server: ep,
          attributes: eg = {},
          platform: eh,
          logCollectorAddr: ef = eG.LOG_COLLECTOR_ADDR,
          enableLocalConsole: em = !1,
          enableConsole: eE = !1,
          level: eC,
          mustLogTraced: ey = !1,
        } = eA,
        ew =
          eu === ex.NamespaceValues.Production ? ex.EnvNameValues.Formal : ec,
        eB =
          ef === eG.LOG_COLLECTOR_ADDR
            ? eG.METRICS_COLLECTOR_ADDR
            : eG.METRICS_COLLECTOR_SG_ADDR,
        e_ = resolveGalileoEncryptionConfig(eA.isEncrypted, eA.encryption);
      ((this.platform = eh),
        (this.serverName = `${ed}.${ep}`),
        (this.enableLocalConsole = em),
        (this.enableConsole = eE),
        (this.mustLogTraced = ey));
      const eI = null == (el = process.env) ? void 0 : el.GALILEO_LOG_LEVEL;
      if (((this.currentLevel = parseLevel(eC || eI)), !this.serverName))
        throw Error("app and server are required");
      (this.initLogRecorder(ew, eg),
        (this.logger = this.initLogger(eu, ew, ef, e_)),
        (this.selfMeter = getSelfMeterProvider(eu, ew, eB, e_).getMeter(
          eG.SELF_MONITOR,
          "",
        )),
        (this.selfAttributes = {
          SdkTarget: `${eh}.${this.serverName}`,
          TargetNameSpace: eu,
          ReportType: "log",
          Protocol: "",
          Kind: "",
          Status: "",
        }),
        (this.nodeInstrumentStartCounter = this.selfMeter.createCounter(
          "node_instrument_start",
          { valueType: eR.ValueType.INT },
        )),
        (this.nodeInstrumentEndCounter = this.selfMeter.createCounter(
          "node_instrument_end",
          { valueType: eR.ValueType.INT },
        )));
      try {
        this.enableConsole && this.overrideConsole();
      } catch (eA) {}
    }
    initLogRecorder(eA, el) {
      this.logRecorder = {
        severityNumber: rg.SeverityNumber.INFO,
        severityText: "info",
        body: "",
        attributes: { ...el, server: this.serverName, env: eA },
        instrumentationScope: { name: "default", version: eG.SDK_VERSION },
      };
    }
    updateLogRecorderAttributes(eA) {
      if (!eA) throw Error("attributes is required");
      this.logRecorder.attributes = { ...this.logRecorder.attributes, ...eA };
    }
    initLogger(eA, el, ec, eu = resolveGalileoEncryptionConfig()) {
      let ed = new rD({ resource: this.getResource(eA) }),
        ep = new rk(
          new GalileoEncryptedLogExporter(
            {
              url: ec,
              headers: { "Content-Type": "application/json" },
              concurrencyLimit: 30,
            },
            eu,
          ),
        );
      return (
        ed.addLogRecordProcessor(ep),
        this.enableLocalConsole &&
          eA !== ex.NamespaceValues.Production &&
          el !== ex.EnvNameValues.Formal &&
          ed.addLogRecordProcessor(new rk(new rM())),
        ed.getLogger("default", eG.SDK_VERSION)
      );
    }
    emit(eA) {
      this.logger.emit(eA);
    }
    overrideConsole() {
      let eA = console,
        el = this;
      ["log", "info", "error", "warn", "debug", "trace"].forEach((ec) => {
        let eu = eA[ec];
        console[ec] = function (...ed) {
          try {
            let eA = Error().stack,
              eu = "";
            if (eA) {
              let el = eA.split("\n");
              el.length > 2 && (eu = el[2].trim());
            }
            if (eu.includes("@tencent/trpc-config-env")) return;
            if (!eu.includes("galileo-node-sdk")) {
              let eA = ed
                .map((eA) => ("string" == typeof eA ? eA : stringifyPlus(eA)))
                .join(" ");
              "log" === ec
                ? el.method("info", `[Console.log] ${eA}`)
                : el.method(ec, `[Console.${ec}] ${eA}`);
            }
          } catch (eA) {}
          eu.apply(eA, ed);
        };
      });
    }
    shouldLog(eA) {
      return eE[eA] >= eE[this.currentLevel];
    }
    method(eA, el, ec) {
      var eu, ed;
      this.nodeInstrumentStartCounter.add(1, { ...this.selfAttributes });
      let ep = eA;
      if (!(ep in eE)) throw Error(`method [${ep}] not found`);
      if (
        !(this.mustLogTraced && isCurrentRequestSampled()) &&
        !this.shouldLog(ep)
      )
        return;
      let eg =
          ec &&
          !(null == (eu = Object.values(ec))
            ? void 0
            : eu.some((eA) => "string" != typeof eA)),
        eh = {},
        ef = eD.trace.getSpan(AP.context.active()),
        em =
          null == (ed = null == ef ? void 0 : ef.attributes)
            ? void 0
            : ed["http.user_agent"];
      em && (eh.user_agent = em);
      let eC = {
        ...this.logRecorder,
        attributes: {
          ...this.logRecorder.attributes,
          ...eh,
          ...(eg ? ec : {}),
        },
        severityNumber: eE[ep],
        severityText: ep,
        body: el,
      };
      (this.nodeInstrumentEndCounter.add(1, {
        ...this.selfAttributes,
        Status: "success",
      }),
        this.emit(eC));
    }
    info(eA, el) {
      this.method("info", eA, el);
    }
    error(eA, el) {
      this.method("error", eA, el);
    }
    debug(eA, el) {
      this.method("debug", eA, el);
    }
    trace(eA, el) {
      this.method("trace", eA, el);
    }
    warn(eA, el) {
      this.method("warn", eA, el);
    }
    sampledInfo(eA, el) {
      this.method("info", eA, el);
    }
  };
  return {
    Logger: logger_Logger,
    parseLevel,
    stringifyPlus,
    isCurrentRequestSampled,
  };
}

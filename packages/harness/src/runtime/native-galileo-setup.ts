// @ts-nocheck
// Captured SetupGalileo orchestration and validation. Dynamic modules are explicit parents.
export const GALILEO_SETUP_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_SETUP_REGIONS = [
  {
    kind: "statement",
    name: "enableInstrumentations",
    start: 7912827,
    end: 7913069,
  },
  {
    kind: "statement",
    name: "disableInstrumentations",
    start: 7913069,
    end: 7913152,
  },
  {
    kind: "statement",
    name: "registerInstrumentations",
    start: 7913152,
    end: 7913503,
  },
  { kind: "declarator", name: "getMachineInfo", start: 8045739, end: 8046221 },
  {
    kind: "declarator",
    name: "checkConfigValid",
    start: 8046222,
    end: 8047178,
  },
  {
    kind: "declarator",
    name: "checkProfilingConfigValid",
    start: 8047179,
    end: 8048528,
  },
  {
    kind: "declarator",
    name: "checkProcessorConfigValid",
    start: 8048529,
    end: 8052868,
  },
  {
    kind: "declarator",
    name: "filterUserExtFields",
    start: 8053461,
    end: 8053612,
  },
  {
    kind: "declarator",
    name: "getCallerAndCalleeInfoFromHeader",
    start: 8054216,
    end: 8054513,
  },
  {
    kind: "statement",
    name: "deriveProfilesAddr",
    start: 8054693,
    end: 8054896,
  },
  { kind: "statement", name: "rp", start: 8054913, end: 8061283 },
] as const;
export const GALILEO_SETUP_MODULES = [[64270, 960595, 962781]] as const;
export function createNativeGalileoSetup(runtime: any) {
  if (!runtime.registry) throw Error("Explicit logs registry required");
  const globalThis = runtime.registry,
    global = runtime.registry;
  const factories = {
      64270(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            SeverityNumber: () => eu.SeverityNumber,
            NoopLogger: () => ed.NoopLogger,
            NOOP_LOGGER: () => ed.NOOP_LOGGER,
            logs: () => ey,
          }));
        var eu = ec(32704),
          ed = ec(99997),
          ep = "object" == typeof globalThis ? globalThis : global,
          eg = Symbol.for("io.opentelemetry.js.api.logs"),
          eh = ep;
        function makeGetter(eA, el, ec) {
          return function (eu) {
            return eu === eA ? el : ec;
          };
        }
        var ef = 1,
          em = new ((function () {
            function NoopLoggerProvider() {}
            return (
              (NoopLoggerProvider.prototype.getLogger = function (eA, el, ec) {
                return new ed.NoopLogger();
              }),
              NoopLoggerProvider
            );
          })())(),
          eE = (function () {
            function ProxyLogger(eA, el, ec, eu) {
              ((this._provider = eA),
                (this.name = el),
                (this.version = ec),
                (this.options = eu));
            }
            return (
              (ProxyLogger.prototype.emit = function (eA) {
                this._getLogger().emit(eA);
              }),
              (ProxyLogger.prototype._getLogger = function () {
                if (this._delegate) return this._delegate;
                var eA = this._provider.getDelegateLogger(
                  this.name,
                  this.version,
                  this.options,
                );
                return eA
                  ? ((this._delegate = eA), this._delegate)
                  : ed.NOOP_LOGGER;
              }),
              ProxyLogger
            );
          })(),
          eC = (function () {
            function ProxyLoggerProvider() {}
            return (
              (ProxyLoggerProvider.prototype.getLogger = function (eA, el, ec) {
                var eu;
                return null != (eu = this.getDelegateLogger(eA, el, ec))
                  ? eu
                  : new eE(this, eA, el, ec);
              }),
              (ProxyLoggerProvider.prototype.getDelegate = function () {
                var eA;
                return null != (eA = this._delegate) ? eA : em;
              }),
              (ProxyLoggerProvider.prototype.setDelegate = function (eA) {
                this._delegate = eA;
              }),
              (ProxyLoggerProvider.prototype.getDelegateLogger = function (
                eA,
                el,
                ec,
              ) {
                var eu;
                return null == (eu = this._delegate)
                  ? void 0
                  : eu.getLogger(eA, el, ec);
              }),
              ProxyLoggerProvider
            );
          })(),
          ey = (function () {
            function LogsAPI() {
              this._proxyLoggerProvider = new eC();
            }
            return (
              (LogsAPI.getInstance = function () {
                return (
                  this._instance || (this._instance = new LogsAPI()),
                  this._instance
                );
              }),
              (LogsAPI.prototype.setGlobalLoggerProvider = function (eA) {
                return eh[eg]
                  ? this.getLoggerProvider()
                  : ((eh[eg] = makeGetter(ef, eA, em)),
                    this._proxyLoggerProvider.setDelegate(eA),
                    eA);
              }),
              (LogsAPI.prototype.getLoggerProvider = function () {
                var eA, el;
                return null !=
                  (el = null == (eA = eh[eg]) ? void 0 : eA.call(eh, ef))
                  ? el
                  : this._proxyLoggerProvider;
              }),
              (LogsAPI.prototype.getLogger = function (eA, el, ec) {
                return this.getLoggerProvider().getLogger(eA, el, ec);
              }),
              (LogsAPI.prototype.disable = function () {
                (delete eh[eg], (this._proxyLoggerProvider = new eC()));
              }),
              LogsAPI
            );
          })().getInstance();
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

  const eM = runtime.resources,
    ex = runtime.enums,
    eG = runtime.sdk,
    eD = { trace: runtime.trace },
    eT = { metrics: runtime.metrics },
    ek = ec(64270),
    rd = runtime.profilerSupport,
    process = runtime.process,
    console = runtime.console,
    resolveGalileoEncryptionConfig =
      runtime.transport.resolveGalileoEncryptionConfig,
    getSelfMeterProvider = runtime.getSelfMeterProvider,
    registerTracerProvider = runtime.registerTracerProvider,
    registerMeterProvider = runtime.registerMeterProvider;
  function enableInstrumentations(eA, el, ec, eu) {
    for (var ed = 0, ep = eA.length; ed < ep; ed++) {
      var eg = eA[ed];
      (el && eg.setTracerProvider(el),
        ec && eg.setMeterProvider(ec),
        eu && eg.setLoggerProvider && eg.setLoggerProvider(eu),
        eg.getConfig().enabled || eg.enable());
    }
  }
  function disableInstrumentations(eA) {
    eA.forEach(function (eA) {
      return eA.disable();
    });
  }
  function registerInstrumentations(eA) {
    var el,
      ec,
      eu = eA.tracerProvider || eD.trace.getTracerProvider(),
      ed = eA.meterProvider || eT.metrics.getMeterProvider(),
      ep = eA.loggerProvider || ek.logs.getLoggerProvider(),
      eg =
        null != (ec = null == (el = eA.instrumentations) ? void 0 : el.flat())
          ? ec
          : [];
    return (
      enableInstrumentations(eg, eu, ed, ep),
      function () {
        disableInstrumentations(eg);
      }
    );
  }
  let getMachineInfo = () => {
    var eA, el, ec, eu, ed;
    let ep = "",
      eg = "";
    try {
      ((ep =
        (null == (eA = null == process ? void 0 : process.env)
          ? void 0
          : eA.HOST_IP) ||
        (null == (el = null == process ? void 0 : process.env)
          ? void 0
          : el.IP) ||
        (null == (ec = null == process ? void 0 : process.env)
          ? void 0
          : ec.POD_IP) ||
        ""),
        (eg =
          (null == (eu = null == process ? void 0 : process.env)
            ? void 0
            : eu.SUMERU_CONTAINER_NAME) ||
          (null == (ed = null == process ? void 0 : process.env)
            ? void 0
            : ed.POD_NAME) ||
          ""));
    } catch (eA) {
      console.log("get host ip fail:", eA);
    }
    return { hostIP: ep, container: eg };
  };
  let checkConfigValid = (eA) => {
    let el = Object.prototype.hasOwnProperty;
    return "object" != typeof eA || null === eA || Array.isArray(eA)
      ? (console.log("config error: 参数配置必须是一个json对象"), !1)
      : el.call(eA, "enableHTTP") &&
          el.call(eA, "enableTRPC") &&
          !eA.enableHTTP &&
          !eA.enableTRPC
        ? (console.log(
            "config error: 参数enableHTTP和enableTRPC至少要启用一个",
          ),
          !1)
        : ["app", "server", "platform", "namespace"].some(
              (ec) => !el.call(eA, ec),
            )
          ? (console.log(
              "config error: 参数配置必须有app, server, platform, namespace",
            ),
            !1)
          : el.call(eA, "filter") &&
              ("object" != typeof eA.filter ||
                null === eA.filter ||
                Array.isArray(eA.filter))
            ? (console.log("config error: 参数filter必须是一个json对象"), !1)
            : el.call(
                  (null == eA ? void 0 : eA.filter) || {},
                  "calleeMethod",
                ) && !Array.isArray(eA.filter.calleeMethod)
              ? (console.log(
                  "config error: 参数calleeMethod必须是一个字符串数组",
                ),
                !1)
              : el.call(
                    (null == eA ? void 0 : eA.filter) || {},
                    "callerMethod",
                  ) && !Array.isArray(eA.filter.callerMethod)
                ? (console.log(
                    "config error: 参数callerMethod必须是一个字符串数组",
                  ),
                  !1)
                : !!checkProfilingConfigValid(eA.profiling);
  };
  let checkProfilingConfigValid = (eA) => {
    if (void 0 === eA) return !0;
    let el = Object.prototype.hasOwnProperty;
    if ("object" != typeof eA || null === eA || Array.isArray(eA))
      return (console.log("config error: profiling 必须是一个json对象"), !1);
    if (el.call(eA, "enable") && "boolean" != typeof eA.enable)
      return (console.log("config error: profiling.enable 必须是布尔值"), !1);
    if (el.call(eA, "processor") && !checkProcessorConfigValid(eA.processor))
      return !1;
    if (el.call(eA, "exporter")) {
      if (
        "object" != typeof eA.exporter ||
        null === eA.exporter ||
        Array.isArray(eA.exporter)
      )
        return (
          console.log("config error: profiling.exporter 必须是一个json对象"),
          !1
        );
      if (
        el.call(eA.exporter, "collectorAddr") &&
        "string" != typeof eA.exporter.collectorAddr
      )
        return (
          console.log(
            "config error: profiling.exporter.collectorAddr 必须是字符串",
          ),
          !1
        );
      if (el.call(eA.exporter, "timeoutMs")) {
        if (
          "number" != typeof eA.exporter.timeoutMs ||
          isNaN(eA.exporter.timeoutMs)
        )
          return (
            console.log(
              "config error: profiling.exporter.timeoutMs 必须是数字",
            ),
            !1
          );
        if (eA.exporter.timeoutMs <= 0)
          return (
            console.log(
              "config error: profiling.exporter.timeoutMs 必须大于 0",
            ),
            !1
          );
      }
      if (
        el.call(eA.exporter, "exportToFile") &&
        "boolean" != typeof eA.exporter.exportToFile
      )
        return (
          console.log(
            "config error: profiling.exporter.exportToFile 必须是布尔值",
          ),
          !1
        );
      if (
        el.call(eA.exporter, "exportDir") &&
        "string" != typeof eA.exporter.exportDir
      )
        return (
          console.log(
            "config error: profiling.exporter.exportDir 必须是字符串",
          ),
          !1
        );
    }
    return !0;
  };
  let checkProcessorConfigValid = (eA) => {
    if (void 0 === eA) return !0;
    let el = Object.prototype.hasOwnProperty;
    if ("object" != typeof eA || null === eA || Array.isArray(eA))
      return (
        console.log("config error: profiling.processor 必须是一个json对象"),
        !1
      );
    if (el.call(eA, "instanceSampleRate")) {
      if (
        "number" != typeof eA.instanceSampleRate ||
        isNaN(eA.instanceSampleRate)
      )
        return (
          console.log(
            "config error: profiling.processor.instanceSampleRate 必须是数字",
          ),
          !1
        );
      if (eA.instanceSampleRate < 0 || eA.instanceSampleRate > 1)
        return (
          console.log(
            "config error: profiling.processor.instanceSampleRate 必须在 0-1 之间",
          ),
          !1
        );
    }
    if (
      el.call(eA, "enableCondition") &&
      "function" != typeof eA.enableCondition
    )
      return (
        console.log(
          "config error: profiling.processor.enableCondition 必须是函数",
        ),
        !1
      );
    if (el.call(eA, "intervalMs")) {
      if ("number" != typeof eA.intervalMs || isNaN(eA.intervalMs))
        return (
          console.log(
            "config error: profiling.processor.intervalMs 必须是数字",
          ),
          !1
        );
      if (eA.intervalMs < 6e4 || eA.intervalMs > 6e5)
        return (
          console.log(
            "config error: profiling.processor.intervalMs 必须在 60000-600000 之间（1-10分钟）",
          ),
          !1
        );
    }
    if (el.call(eA, "samplingIntervalMs")) {
      if (
        "number" != typeof eA.samplingIntervalMs ||
        isNaN(eA.samplingIntervalMs)
      )
        return (
          console.log(
            "config error: profiling.processor.samplingIntervalMs 必须是数字",
          ),
          !1
        );
      if (eA.samplingIntervalMs < 1 || eA.samplingIntervalMs > 1e3)
        return (
          console.log(
            "config error: profiling.processor.samplingIntervalMs 必须在 1-1000 之间",
          ),
          !1
        );
    }
    if (el.call(eA, "sourceMap") && "boolean" != typeof eA.sourceMap)
      return (
        console.log("config error: profiling.processor.sourceMap 必须是布尔值"),
        !1
      );
    if (el.call(eA, "enabledTypes")) {
      if (
        "object" != typeof eA.enabledTypes ||
        null === eA.enabledTypes ||
        Array.isArray(eA.enabledTypes)
      )
        return (
          console.log(
            "config error: profiling.processor.enabledTypes 必须是一个json对象",
          ),
          !1
        );
      let el = ["cpu", "heap", "wall", "events", "eventLoop"];
      for (let ec of Object.keys(eA.enabledTypes)) {
        if (!el.includes(ec))
          return (
            console.log(
              `config error: profiling.processor.enabledTypes 包含无效的类型 "${ec}"，有效类型为: ${el.join(", ")}`,
            ),
            !1
          );
        if ("boolean" != typeof eA.enabledTypes[ec])
          return (
            console.log(
              `config error: profiling.processor.enabledTypes.${ec} 必须是布尔值`,
            ),
            !1
          );
      }
    }
    if (el.call(eA, "events")) {
      if (
        "object" != typeof eA.events ||
        null === eA.events ||
        Array.isArray(eA.events)
      )
        return (
          console.log(
            "config error: profiling.processor.events 必须是一个json对象",
          ),
          !1
        );
      if (el.call(eA.events, "enabledEventTypes")) {
        if (!Array.isArray(eA.events.enabledEventTypes))
          return (
            console.log(
              "config error: profiling.processor.events.enabledEventTypes 必须是一个数组",
            ),
            !1
          );
        let el = ["gc", "dns", "net"];
        for (let ec of eA.events.enabledEventTypes)
          if (!el.includes(ec))
            return (
              console.log(
                `config error: profiling.processor.events.enabledEventTypes 包含无效的事件类型 "${ec}"，有效类型为: ${el.join(", ")}`,
              ),
              !1
            );
      }
      if (el.call(eA.events, "maxSamples")) {
        if (
          "number" != typeof eA.events.maxSamples ||
          isNaN(eA.events.maxSamples)
        )
          return (
            console.log(
              "config error: profiling.processor.events.maxSamples 必须是数字",
            ),
            !1
          );
        if (eA.events.maxSamples <= 0)
          return (
            console.log(
              "config error: profiling.processor.events.maxSamples 必须大于 0",
            ),
            !1
          );
      }
    }
    if (el.call(eA, "eventLoop")) {
      if (
        "object" != typeof eA.eventLoop ||
        null === eA.eventLoop ||
        Array.isArray(eA.eventLoop)
      )
        return (
          console.log(
            "config error: profiling.processor.eventLoop 必须是一个json对象",
          ),
          !1
        );
      if (el.call(eA.eventLoop, "resolution")) {
        if (
          "number" != typeof eA.eventLoop.resolution ||
          isNaN(eA.eventLoop.resolution)
        )
          return (
            console.log(
              "config error: profiling.processor.eventLoop.resolution 必须是数字",
            ),
            !1
          );
        if (eA.eventLoop.resolution <= 0)
          return (
            console.log(
              "config error: profiling.processor.eventLoop.resolution 必须大于 0",
            ),
            !1
          );
      }
    }
    if (el.call(eA, "oomMonitoring")) {
      if (
        "object" != typeof eA.oomMonitoring ||
        null === eA.oomMonitoring ||
        Array.isArray(eA.oomMonitoring)
      )
        return (
          console.log(
            "config error: profiling.processor.oomMonitoring 必须是一个json对象",
          ),
          !1
        );
      if (
        el.call(eA.oomMonitoring, "enabled") &&
        "boolean" != typeof eA.oomMonitoring.enabled
      )
        return (
          console.log(
            "config error: profiling.processor.oomMonitoring.enabled 必须是布尔值",
          ),
          !1
        );
      if (
        el.call(eA.oomMonitoring, "heapLimitExtensionSize") &&
        ("number" != typeof eA.oomMonitoring.heapLimitExtensionSize ||
          isNaN(eA.oomMonitoring.heapLimitExtensionSize))
      )
        return (
          console.log(
            "config error: profiling.processor.oomMonitoring.heapLimitExtensionSize 必须是数字",
          ),
          !1
        );
      if (
        el.call(eA.oomMonitoring, "maxHeapExtensionCount") &&
        ("number" != typeof eA.oomMonitoring.maxHeapExtensionCount ||
          isNaN(eA.oomMonitoring.maxHeapExtensionCount))
      )
        return (
          console.log(
            "config error: profiling.processor.oomMonitoring.maxHeapExtensionCount 必须是数字",
          ),
          !1
        );
    }
    return !0;
  };
  let filterUserExtFields = (eA) =>
    eA && "object" == typeof eA
      ? Object.fromEntries(
          Object.entries(eA).filter(([eA]) =>
            eG.RESERVED_USER_EXT_FIELDS.some((el) => el === eA),
          ),
        )
      : {};
  let getCallerAndCalleeInfoFromHeader = (eA) => {
    let el = eG.CALLER_AND_CALLEE_INFO_FIELDS_DEFAULT,
      ec = Object.prototype.hasOwnProperty;
    return (
      Object.keys(eG.CALLER_AND_CALLEE_INFO_FIELDS_DEFAULT).forEach((eu) => {
        var ed;
        ec.call(eA || {}, eu) &&
          (el[eu] =
            (null == (ed = null == eA ? void 0 : eA[eu])
              ? void 0
              : ed.toString()) || "");
      }),
      el
    );
  };
  function deriveProfilesAddr(eA) {
    try {
      let el = new URL(eA).hostname;
      if ("sg.tgalileo.com" === el || el.endsWith(".sg.tgalileo.com"))
        return eG.PROFILE_COLLECTOR_SG_ADDR;
    } catch (eA) {}
    return eG.PROFILE_COLLECTOR_ADDR;
  }
  let rp = null,
    SetupGalileo = async (eA) => {
      var el, eu, ed, ep, eg;
      if (!checkConfigValid(eA)) return;
      let {
          platform: eh,
          app: ef,
          server: em,
          namespace: eE,
          env: eC = ex.EnvNameValues.Test,
          metricsCollectorAddr: ey = eG.METRICS_COLLECTOR_ADDR,
          traceCollectorAddr: ew = eG.TRACE_COLLECTOR_ADDR,
          logCollectorAddr: eB = eG.LOG_COLLECTOR_ADDR,
          filter: e_ = { calleeMethod: [], callerMethod: [] },
          enableHTTP: eI = !0,
          enableTRPC: ev = !0,
          enableFetch: eS = !0,
          traceConfig: eQ = eG.TRACE_CONFIG,
          isEncrypted: eD = !0,
          encryption: eT,
          instrumentations: eR = [],
          enableRemoteConfig: ek = !0,
        } = eA,
        eO = resolveGalileoEncryptionConfig(eD, eT),
        eN = null;
      if (ek) {
        let { Config: eA } = await Promise.resolve().then(ec.bind(ec, 86097));
        ((eN = new eA({
          platform: eh,
          app: ef,
          server: em,
          namespace: eE,
          env: eC,
          addr: ew === eG.TRACE_COLLECTOR_ADDR ? eG.OCP_ADDR : eG.OCP_SG_ADDR,
        })),
          await eN.startPull());
      }
      let eP = `${ef}.${em}`,
        eL = {
          [ex.GalileoResourceAttributes.Target]: `${eh}.${eP}`,
          [ex.GalileoResourceAttributes.ServiceName]: eP,
          [ex.GalileoResourceAttributes.Namespace]: eE,
          [ex.GalileoResourceAttributes.EnvName]:
            eE === ex.NamespaceValues.Production ? ex.EnvNameValues.Formal : eC,
          [ex.GalileoResourceAttributes.Version]: eG.SDK_VERSION,
        },
        eF = {
          ...eL,
          [ex.GalileoTraceResourceAttributes.SERVICE_NAME]: eP,
          [ex.GalileoTraceResourceAttributes.SDK_NAME]: ex.SDKNameValue,
          [ex.GalileoTraceResourceAttributes.LANGUAGE]:
            ex.LanguageValues.Nodejs,
        },
        { hostIP: eU, container: ej } = getMachineInfo(),
        eH = {
          ...eL,
          [ex.GalileoResourceAttributes.Instance]: eU,
          [ex.GalileoResourceAttributes.ContainerName]: ej,
          [ex.GalileoResourceAttributes.ConSetid]: "",
          city:
            null ==
            (ed =
              null ==
              (eu =
                null == (el = null == ej ? void 0 : ej.split("."))
                  ? void 0
                  : el.reverse())
                ? void 0
                : eu[0])
              ? void 0
              : ed.slice(0, 2),
        },
        eK = getSelfMeterProvider(eE, eC, ey, eO),
        e$ = registerTracerProvider({
          resource: new eM.Resource(eF),
          addr: ew,
          filter: e_,
          traceConfig: { local: eQ, remote: eN },
          encryption: eO,
        }),
        eY = registerMeterProvider({
          resource: new eM.Resource(eH),
          addr: ey,
          remote: eN,
          encryption: eO,
        }),
        eJ = [];
      try {
        eJ = [
          ey,
          ew,
          eB,
          eG.OCP_ADDR,
          eG.OCP_SG_ADDR,
          eG.PROFILE_COLLECTOR_ADDR,
          eG.PROFILE_COLLECTOR_SG_ADDR,
        ].map((eA) => {
          var el;
          return ((el = new URL(eA)), void 0 === el) ? void 0 : el.hostname;
        });
      } catch (eA) {
        eJ = [];
      }
      let ez = [],
        eW = {
          ...eH,
          selfMonitor: eG.SELF_MONITOR,
          collectorAddr: [ey, ew],
          filter: e_,
          enableTraceBody: eQ.processor.enableTraceBody,
        };
      if (eI) {
        let { HttpInstrumentation: el } = await Promise.resolve().then(
          ec.bind(ec, 9808),
        );
        ez.push(
          new el({
            meterProvider: eY,
            selfMeterProvider: eK,
            pluginParams: eW,
            startIncomingSpanHook: (el) => {
              var ec, eu;
              let ed =
                  (null == (ec = null == eA ? void 0 : eA.startIncomingSpan)
                    ? void 0
                    : ec.call(eA, el)) || {},
                ep = Object.prototype.hasOwnProperty;
              if (ek) {
                let eA = null == eN ? void 0 : eN.getData();
                null == (eu = null == eA ? void 0 : eA.map((eA) => eA.key)) ||
                  eu.forEach((eA) => {
                    ep.call((null == el ? void 0 : el.headers) || {}, eA) &&
                      (ed[eA] = el.headers[eA]);
                  });
              }
              if (null == eA ? void 0 : eA.handleIncomingUserExt) {
                let ec = filterUserExtFields(eA.handleIncomingUserExt(el));
                ed = { ...ed, ...ec };
              }
              return (ed = {
                ...getCallerAndCalleeInfoFromHeader(el.headers),
                ...ed,
              });
            },
            startOutgoingSpanHook: (el) => {
              var ec, eu;
              let ed =
                  (null == (ec = null == eA ? void 0 : eA.startOutgoingSpan)
                    ? void 0
                    : ec.call(eA, el)) || {},
                ep = Object.prototype.hasOwnProperty;
              if (ek) {
                let eA = null == eN ? void 0 : eN.getData();
                null == (eu = null == eA ? void 0 : eA.map((eA) => eA.key)) ||
                  eu.forEach((eA) => {
                    var ec;
                    ep.call((null == el ? void 0 : el.headers) || {}, eA) &&
                      (ed[eA] = null == (ec = el.headers) ? void 0 : ec[eA]);
                  });
              }
              if (null == eA ? void 0 : eA.handleOutgoingUserExt) {
                let ec = filterUserExtFields(eA.handleOutgoingUserExt(el));
                ed = { ...ed, ...ec };
              }
              return (ed = {
                ...getCallerAndCalleeInfoFromHeader(el.headers),
                ...ed,
              });
            },
            rewriteIncomingReqHeaders: (el) => {
              var ec;
              return {
                ...((null ==
                (ec = null == eA ? void 0 : eA.rewriteIncomingReqHeaders)
                  ? void 0
                  : ec.call(eA, el)) || el),
              };
            },
            ignoreIncomingRequestHook: (el) => {
              var ec;
              return (
                null != (ec = null == eA ? void 0 : eA.filterIncomingRequest) &&
                !!ec.call(eA, el)
              );
            },
            ignoreOutgoingRequestHook: (el) => {
              var ec;
              return !!(
                eJ.includes((null == el ? void 0 : el.hostname) || "") ||
                (null == (ec = null == eA ? void 0 : eA.filterOutgoingRequest)
                  ? void 0
                  : ec.call(eA, el))
              );
            },
            applyCustomAttributesOnSpan: (eA) => {
              (eA.setAttribute(ex.GalileoTraceAttributes.TRPC_NAMESPACE, eE),
                eA.setAttribute(
                  ex.GalileoTraceAttributes.TRPC_ENV_NAME,
                  eE === ex.NamespaceValues.Production
                    ? ex.EnvNameValues.Formal
                    : eC,
                ));
            },
            ...((null == eA ? void 0 : eA.rewriteIncomingRetCode)
              ? {
                  rewriteIncomingRetCode: (el) => eA.rewriteIncomingRetCode(el),
                }
              : {}),
          }),
        );
      }
      if (ev) {
        let { TrpcServerInstrumentation: eA, TrpcClientInstrumentation: el } =
          await Promise.resolve().then(ec.bind(ec, 3057));
        ez.push(
          new el({
            meterProvider: eY,
            selfMeterProvider: eK,
            pluginParams: eW,
          }),
          new eA({
            meterProvider: eY,
            selfMeterProvider: eK,
            pluginParams: eW,
          }),
        );
      }
      if (eS) {
        let { FetchInstrumentation: el } = await Promise.resolve().then(
          ec.bind(ec, 8009),
        );
        ez.push(
          new el({
            meterProvider: eY,
            selfMeterProvider: eK,
            pluginParams: eW,
            startOutgoingSpanHook: (el) => {
              var ec;
              let eu = {},
                ed = Object.prototype.hasOwnProperty;
              if (ek) {
                let eA = null == eN ? void 0 : eN.getData();
                null == (ec = null == eA ? void 0 : eA.map((eA) => eA.key)) ||
                  ec.forEach((eA) => {
                    var ec;
                    ed.call((null == el ? void 0 : el.headers) || {}, eA) &&
                      (eu[eA] = null == (ec = el.headers) ? void 0 : ec[eA]);
                  });
              }
              if (null == eA ? void 0 : eA.handleOutgoingUserExt) {
                let ec = filterUserExtFields(eA.handleOutgoingUserExt(el));
                eu = { ...eu, ...ec };
              }
              return (eu = {
                ...getCallerAndCalleeInfoFromHeader(el.headers),
                ...eu,
              });
            },
            ignoreOutgoingRequestHook: (el) => {
              var ec;
              return !!(
                eJ.includes(el.hostname || "") ||
                (null == (ec = null == eA ? void 0 : eA.filterOutgoingRequest)
                  ? void 0
                  : ec.call(eA, el))
              );
            },
            applyCustomAttributesOnSpan: (eA) => {
              (eA.setAttribute(ex.GalileoTraceAttributes.TRPC_NAMESPACE, eE),
                eA.setAttribute(
                  ex.GalileoTraceAttributes.TRPC_ENV_NAME,
                  eE === ex.NamespaceValues.Production
                    ? ex.EnvNameValues.Formal
                    : eC,
                ));
            },
          }),
        );
      }
      if (
        (eR && Array.isArray(eR) && ez.push(...eR),
        registerInstrumentations({ tracerProvider: e$, instrumentations: ez }),
        null == (ep = eA.profiling) ? void 0 : ep.enable)
      )
        try {
          if ("win32" === process.platform)
            return void console.warn(
              "[Galileo Profiler] Profiling is not supported on Windows. Profiling disabled.",
            );
          if (rd.NODE_VERSION_SUPPORTED) {
            let { ProfilerManager: el } = await Promise.resolve().then(
                ec.bind(ec, 38609),
              ),
              eu =
                (null == (eg = eA.profiling.exporter)
                  ? void 0
                  : eg.collectorAddr) || deriveProfilesAddr(ew);
            ((rp = new el({
              resource: {
                target: `${eh}.${eP}`,
                namespace: eE,
                envName:
                  eE === ex.NamespaceValues.Production
                    ? ex.EnvNameValues.Formal
                    : eC,
                serviceName: eP,
                instance: eU,
                containerName: ej,
                version: eG.SDK_VERSION,
              },
              ...eA.profiling,
              exporter: { ...eA.profiling.exporter, collectorAddr: eu },
            })),
              await rp.start());
          } else
            console.warn(
              `[Galileo Profiler] Profiling requires Node.js >= ${rd.MIN_NODE_VERSION}, current version is ${process.versions.node}. Profiling disabled.`,
            );
        } catch (eA) {
          console.error("[Galileo] Failed to start profiler:", eA);
        }
    };
  return {
    SetupGalileo,
    checkConfigValid,
    checkProfilingConfigValid,
    checkProcessorConfigValid,
    getMachineInfo,
    filterUserExtFields,
    getCallerAndCalleeInfoFromHeader,
    deriveProfilesAddr,
    registerInstrumentations,
    logs: ek.logs,
    getModule: ec,
    getProfiler: () => rp,
  };
}

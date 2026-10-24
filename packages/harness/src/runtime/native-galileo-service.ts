// @ts-nocheck
// Original service statements from factory 92763. Embedded SDK setup remains explicit.
export const GALILEO_SERVICE_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_SERVICE_REGIONS = [
  [8083813, 8084334],
  [8084334, 8084524],
  [8084524, 8094684],
  [8094684, 8095587],
] as const;
export function createNativeGalileoService(runtime: any) {
  if (!runtime?.process || !runtime.SetupGalileo || !runtime.Logger)
    throw Error("Explicit Galileo process, SDK setup and logger required");
  const process = runtime.process,
    Date = runtime.Date ?? globalThis.Date,
    Reflect = runtime.Reflect ?? globalThis.Reflect,
    URL = runtime.URL ?? globalThis.URL,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  function ec(id: number) {
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit Galileo parent required: " + id);
    return value;
  }
  const eB = ec(40602),
    e_ = ec(48161),
    eI = ec(80699),
    ev = ec(86482),
    eS = ec(9151),
    eQ = ec(92735),
    eD = ec(23258),
    eT = ec(37366),
    eR = ec(11447),
    ex = ec(15183),
    SetupGalileo = runtime.SetupGalileo,
    logger_Logger = runtime.Logger;
  let eC, ey, ew;
  var rx = ec(64007),
    __decorate = function (eA, el, ec, eu) {
      var ed,
        ep = arguments.length,
        eg =
          ep < 3
            ? el
            : null === eu
              ? (eu = Object.getOwnPropertyDescriptor(el, ec))
              : eu;
      if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
        eg = Reflect.decorate(eA, el, ec, eu);
      else
        for (var eh = eA.length - 1; eh >= 0; eh--)
          (ed = eA[eh]) &&
            (eg =
              (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) || eg);
      return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
    },
    __metadata = function (eA, el) {
      if ("object" == typeof Reflect && "function" == typeof Reflect.metadata)
        return Reflect.metadata(eA, el);
    };
  function isGalileoOtlpRequest(eA, el) {
    try {
      return (
        ("string" == typeof eA
          ? new URL(eA).hostname
          : eA instanceof URL
            ? eA.hostname
            : String(eA?.hostname ?? eA?.host ?? "").split(":")[0]) === el
      );
    } catch {
      return !1;
    }
  }
  let rO = (eC = class {
    constructor() {
      ((this.ready = !1),
        (this.meter = null),
        (this.galileoLogger = null),
        (this.otelMeterProvider = null),
        (this.otelTracerProvider = null),
        (this.otelLoggerProvider = null),
        (this.histograms = new Map()),
        (this.counters = new Map()),
        (this._shouldInit = !1),
        (this._ValueType = null),
        (this._stopped = !1));
    }
    initialize() {
      if (process.env.DISABLE_GALILEO) {
        ((process.env.GALILEO_ENABLE = "false"),
          (process.env.GALILEO_SDK_READY = "0"));
        return;
      }
      ((this._shouldInit = !0), (this._initPromise = this.doInit()));
    }
    async onStart() {
      if (!this._shouldInit) return;
    }
    async doInit() {
      try {
        let eA = await this.productManager.waitConfiguration(),
          el = eA?.galileo,
          ec = (0, eS.resolveGalileoConfig)(el, { platform: "ElectronApp" });
        if (!ec.enabled || !ec.canExportOtlp) {
          ((process.env.GALILEO_ENABLE = "false"),
            (process.env.GALILEO_SDK_READY = "0"),
            this.logger.warn(
              `[GalileoService] disabled or invalid config, skipping: ${ec.issues.join(",") || "disabled"}`,
            ));
          return;
        }
        ((process.env.GALILEO_ENABLE = "true"),
          (this.galileoFingerprint = ec.fingerprint),
          (this._patchName = el?.patchName));
        try {
          let eA = await this.clientInfoProvider?.get();
          this._clientVersion = eA?.productVersion;
        } catch {}
        try {
          if (!this._stopped) {
            let eA = this.authenticationManager?.currentSessionSubject;
            eA &&
              (this.authSubscription = eA.subscribe((eA) => {
                this._uid = eA?.account?.uid ?? void 0;
              }));
          }
        } catch (eA) {
          this.logger.warn(
            `[GalileoService] subscribe auth session failed: ${eA}`,
          );
        }
        (await this.doSetup(el, ec),
          !this._stopped &&
            this.productManager.onDidChange &&
            (this.productConfigDisposable = this.productManager.onDidChange(
              () => {
                this.handleProductConfigurationChanged().catch((eA) => {
                  this.logger.warn(
                    `[GalileoService] config change handling failed: ${eA}`,
                  );
                });
              },
            )));
      } catch (eA) {
        (this.logger.warn(`[GalileoService] initialization failed: ${eA}`),
          (this.ready = !1),
          (process.env.GALILEO_SDK_READY = "0"));
      }
    }
    onStop() {
      this._stopped = !0;
      try {
        (this.authSubscription?.unsubscribe(),
          (this.authSubscription = void 0),
          this.productConfigDisposable?.dispose(),
          (this.productConfigDisposable = void 0));
      } catch {}
      try {
        (this.startupSpan?.end(), (this.startupSpan = void 0));
      } catch {}
    }
    async doSetup(eA, el) {
      let ec = "ElectronApp",
        eu = el.app,
        ed = el.server,
        ep =
          "development" === process.env.WORKBUDDY_NODE_ENV
            ? ex.NamespaceValues.Development
            : ex.NamespaceValues.Production,
        eg = el.metricsUrl,
        eh = el.tracesUrl,
        ef = el.logsUrl;
      (this.patchOtlpHttpProxyAgent(new URL(el.endpoint).hostname),
        await SetupGalileo({
          platform: ec,
          app: eu,
          server: ed,
          namespace: ep,
          metricsCollectorAddr: eg,
          traceCollectorAddr: eh,
          logCollectorAddr: ef,
          enableHTTP: !0,
          enableTRPC: !1,
          traceConfig: {
            enable: !0,
            processor: {
              sampler: {
                fraction: 1,
                enableParentSample: !0,
                enableRandomSample: !0,
              },
              enableTraceBody: !1,
            },
          },
        }),
        (this.tracer = eD.trace.getTracer("workbuddy.agent")),
        (this.startupSpan = this.tracer.startSpan(
          "workbuddy.agent_cli.galileo.startup",
        )),
        this.startupSpan.setAttributes(
          this.withGlobalAttrs({
            "galileo.mvp": !0,
            "galileo.channel": "trace",
            "process.pid": process.pid,
          }),
        ),
        this.startupSpan.addEvent("galileo.setup.completed"),
        (this.meter = eT.metrics.getMeter("workbuddy.agent")),
        (this._ValueType = eR.ValueType));
      try {
        let eA = eT.metrics.getMeterProvider?.();
        eA &&
          "function" == typeof eA.forceFlush &&
          (this.otelMeterProvider = eA);
        let el = eD.trace.getTracerProvider?.(),
          ec =
            el && "function" == typeof el.getDelegate ? el.getDelegate() : el;
        ec &&
          "function" == typeof ec.forceFlush &&
          (this.otelTracerProvider = ec);
      } catch (eA) {
        this.logger.warn(
          `[GalileoService] capture OTel provider refs failed: ${eA}`,
        );
      }
      (this.otelTracerProvider &&
        this.tracerProvider?.attachPrimaryProcessorToGlobalProvider &&
        (await this.tracerProvider.attachPrimaryProcessorToGlobalProvider(
          this.otelTracerProvider,
        )),
        (this.galileoLogger = new logger_Logger({
          platform: ec,
          app: eu,
          server: ed,
          namespace: ep,
          logCollectorAddr: ef,
          attributes: this.buildGlobalLogAttributes(),
        })));
      try {
        let eA = this.resolveOtelLogFlushTarget(this.galileoLogger);
        eA
          ? (this.otelLoggerProvider = eA)
          : this.logger.warn(
              "[GalileoService] log flush target unavailable; exit log flush is disabled",
            );
      } catch (eA) {
        this.logger.warn(
          `[GalileoService] capture logger provider ref failed: ${eA}`,
        );
      }
      ((this.ready = !0),
        (process.env.GALILEO_SDK_READY = "1"),
        this.logger.info("[GalileoService] initialized successfully"));
    }
    resolveOtelLogFlushTarget(eA) {
      let el = eA?.logger;
      return [
        el?._loggerProvider,
        el?.loggerProvider,
        el?._sharedState?.activeProcessor,
      ].find((eA) => eA && "function" == typeof eA.forceFlush);
    }
    recordDuration(eA, el, ec) {
      if (this.meter)
        try {
          let eu = this.histograms.get(eA);
          eu ||
            ((eu = this.meter.createHistogram(eA, {
              valueType: this._ValueType?.DOUBLE ?? 1,
            })),
            this.histograms.set(eA, eu));
          let ed = this.withGlobalDimensions(ec);
          (eu.record(el, ed),
            this.logInfo(eA, { name: eA, duration_ms: el, ...ed }));
        } catch {}
    }
    addCounter(eA, el, ec) {
      if (this.meter && !(el <= 0))
        try {
          let eu = this.counters.get(eA);
          (eu ||
            ((eu = this.meter.createCounter(eA, {
              valueType: this._ValueType?.INT ?? 0,
            })),
            this.counters.set(eA, eu)),
            eu.add(el, this.withGlobalDimensions(ec)));
        } catch {}
    }
    normalizeAttributes(eA) {
      if (!eA) return {};
      let el = {};
      for (let [ec, eu] of Object.entries(eA))
        el[ec] = null == eu ? "" : String(eu);
      return el;
    }
    logInfo(eA, el) {
      if (this.galileoLogger)
        try {
          this.galileoLogger.info(
            eA,
            this.normalizeAttributes(this.withGlobalAttrs(el)),
          );
        } catch (eA) {
          this.logger.warn(`[GalileoService] logInfo failed: ${eA}`);
        }
    }
    logError(eA, el) {
      if (this.galileoLogger)
        try {
          this.galileoLogger.error(
            eA,
            this.normalizeAttributes(this.withGlobalAttrs(el)),
          );
        } catch (eA) {
          this.logger.warn(`[GalileoService] logError failed: ${eA}`);
        }
    }
    isReady() {
      return this.ready;
    }
    async waitReady(eA = 5e3) {
      if (this.ready || !this._initPromise) return;
      let el = Date.now() + eA;
      try {
        await this.withTimeout(
          this._initPromise.catch(() => {}),
          Math.max(0, el - Date.now()),
          "waitReady",
        );
      } catch {}
    }
    async forceFlush(eA = 2e3) {
      let el = Date.now() + eA,
        remain = () => Math.max(0, el - Date.now());
      if (
        (this._initPromise &&
          (await this.withTimeout(
            this._initPromise.catch(() => {}),
            remain(),
            "init.wait",
          )),
        !this.ready)
      )
        return;
      try {
        (this.startupSpan?.addEvent("galileo.force_flush"),
          this.startupSpan?.end(),
          (this.startupSpan = void 0));
      } catch {}
      let safe = async (eA, el) => {
        try {
          let ec = el();
          if (!ec) return;
          await this.withTimeout(ec, remain(), eA);
        } catch (el) {
          this.logger.warn(`[GalileoService] ${eA} failed: ${el}`);
        }
      };
      await Promise.all([
        safe("meter.forceFlush", () => this.otelMeterProvider?.forceFlush?.()),
        safe("trace.forceFlush", () => this.otelTracerProvider?.forceFlush?.()),
        safe("log.forceFlush", () => this.otelLoggerProvider?.forceFlush?.()),
      ]);
    }
    async shutdown(eA = 2e3) {
      if (this.shutdownPromise) return this.shutdownPromise;
      let el = Date.now() + eA,
        remain = () => Math.max(0, el - Date.now());
      if (
        (this._initPromise &&
          (await this.withTimeout(
            this._initPromise.catch(() => {}),
            remain(),
            "init.wait",
          )),
        this.ready)
      ) {
        try {
          (this.startupSpan?.addEvent("galileo.shutdown"),
            this.startupSpan?.end(),
            (this.startupSpan = void 0));
        } catch {}
        return (
          (this.shutdownPromise = (async () => {
            let safe = async (eA, el) => {
              try {
                let ec = el();
                if (!ec) return;
                await this.withTimeout(ec, remain(), eA);
              } catch (el) {
                this.logger.warn(`[GalileoService] ${eA} failed: ${el}`);
              }
            };
            (await Promise.all([
              safe("meter.forceFlush", () =>
                this.otelMeterProvider?.forceFlush?.(),
              ),
              safe("trace.forceFlush", () =>
                this.otelTracerProvider?.forceFlush?.(),
              ),
              safe("log.forceFlush", () =>
                this.otelLoggerProvider?.forceFlush?.(),
              ),
            ]),
              await Promise.all([
                safe("meter.shutdown", () =>
                  this.otelMeterProvider?.shutdown?.(),
                ),
                safe("trace.shutdown", () =>
                  this.otelTracerProvider?.shutdown?.(),
                ),
                safe("log.shutdown", () =>
                  this.otelLoggerProvider?.shutdown?.(),
                ),
              ]),
              (this.ready = !1));
          })()),
          this.shutdownPromise
        );
      }
    }
    withTimeout(eA, el, ec) {
      return el <= 0
        ? Promise.resolve()
        : new Promise((ec, eu) => {
            let ed = setTimeout(() => ec(), el);
            ("function" == typeof ed.unref && ed.unref(),
              Promise.resolve(eA).then(
                (eA) => {
                  (clearTimeout(ed), ec(eA));
                },
                (eA) => {
                  (clearTimeout(ed), eu(eA));
                },
              ));
          });
    }
    withGlobalDimensions(eA) {
      let el = eA ?? {},
        ec = {};
      return (
        this._patchName && (ec.patchName = this._patchName),
        this._clientVersion &&
          ((ec.clientVersion = this._clientVersion),
          (ec.appVersion = this._clientVersion)),
        this._uid && (ec.uid = this._uid),
        Object.keys(ec).length > 0 ? { ...el, ...ec } : el
      );
    }
    withGlobalAttrs(eA) {
      let el = eA ?? {},
        ec = {};
      return (
        this._patchName && (ec.patchName = this._patchName),
        this._clientVersion &&
          ((ec.clientVersion = this._clientVersion),
          (ec.appVersion = this._clientVersion)),
        this._uid && (ec.uid = this._uid),
        Object.keys(ec).length > 0 ? { ...el, ...ec } : el
      );
    }
    patchOtlpHttpProxyAgent(eA) {
      if (eC.otlpHttpProxyAgentPatched) return;
      let el =
        process.env.OTEL_EXPORTER_OTLP_PROXY_URL ??
        process.env.HTTPS_PROXY ??
        process.env.https_proxy ??
        process.env.HTTP_PROXY ??
        process.env.http_proxy;
      if (!el) {
        eC.otlpHttpProxyAgentPatched = !0;
        return;
      }
      try {
        let eu = ec(44708),
          ed = eu.request,
          ep = new rx.HttpsProxyAgent(el, { keepAlive: !0 });
        ((eu.request = function (...el) {
          return (
            isGalileoOtlpRequest(el[0], eA) &&
              ("string" == typeof el[0] || el[0] instanceof URL
                ? "function" == typeof el[1] || null == el[1]
                  ? el.splice(1, 0, { agent: ep })
                  : (el[1] = { ...el[1], agent: ep })
                : (el[0] = { ...el[0], agent: ep })),
            ed.apply(eu, el)
          );
        }),
          (eC.otlpHttpProxyAgentPatched = !0),
          this.logger.info(
            `[GalileoService] OTLP HTTPS traffic will be sent through proxy: ${el}`,
          ));
      } catch (eA) {
        this.logger.warn(
          `[GalileoService] patch OTLP proxy agent failed: ${eA}`,
        );
      }
    }
    async handleProductConfigurationChanged() {
      if (this._stopped || !this.galileoFingerprint) return;
      let eA = await this.productManager.waitConfiguration(),
        el = eA?.galileo,
        ec = (0, eS.resolveGalileoConfig)(el, { platform: "ElectronApp" });
      if (ec.fingerprint !== this.galileoFingerprint) {
        if (
          ((this.galileoFingerprint = ec.fingerprint),
          this.logger.info(
            "[GalileoService] route changed; shutting down current SDK generation and rebuilding",
          ),
          await this.shutdown(2e3),
          (process.env.GALILEO_ENABLE = "false"),
          (process.env.GALILEO_SDK_READY = "0"),
          !ec.enabled || !ec.canExportOtlp)
        )
          return void this.logger.warn(
            `[GalileoService] new config disabled or invalid, staying shutdown: ${ec.issues.join(",") || "disabled"}`,
          );
        ((this.shutdownPromise = void 0),
          (this.ready = !1),
          (process.env.GALILEO_ENABLE = "true"),
          (this._patchName = el?.patchName),
          await this.doSetup(el, ec));
      }
    }
    buildGlobalLogAttributes() {
      let eA = e_.cpus(),
        el = process.env,
        ec = {
          os: process.platform,
          arch: process.arch,
          osVersion: e_.release(),
          cpuCores: String(eA.length),
          cpuModel: (eA[0]?.model ?? "unknown").slice(0, 64),
          memoryGB: String(Math.round(e_.totalmem() / 1024 / 1024 / 1024)),
          nodeVersion: process.version,
          appName: el.CLIENT_INFO_PRODUCT_NAME || "agent-cli",
          ideType: el.CLIENT_INFO_IDE_TYPE || "agent-cli",
        };
      return (
        el.CLIENT_INFO_PRODUCT_VERSION &&
          (ec.appVersion = el.CLIENT_INFO_PRODUCT_VERSION),
        el.CLIENT_INFO_PLUGIN_NAME && (ec.extName = el.CLIENT_INFO_PLUGIN_NAME),
        el.CLIENT_INFO_PLUGIN_VERSION &&
          (ec.extVersion = el.CLIENT_INFO_PLUGIN_VERSION),
        el.CLIENT_INFO_DOWNLOAD_CHANNEL &&
          (ec.downloadChannel = el.CLIENT_INFO_DOWNLOAD_CHANNEL),
        ec
      );
    }
  });
  ((rO.otlpHttpProxyAgentPatched = !1),
    __decorate(
      [
        (0, eI.Autowired)(eQ.Logger),
        __metadata(
          "design:type",
          "function" == typeof (ey = void 0 !== eQ.Logger && eQ.Logger)
            ? ey
            : Object,
        ),
      ],
      rO.prototype,
      "logger",
      void 0,
    ),
    __decorate(
      [
        (0, eI.Autowired)(eS.ProductManager),
        __metadata(
          "design:type",
          "function" ==
            typeof (ew = void 0 !== eS.ProductManager && eS.ProductManager)
            ? ew
            : Object,
        ),
      ],
      rO.prototype,
      "productManager",
      void 0,
    ),
    __decorate(
      [
        (0, eI.Autowired)(eS.ClientInfoProvider),
        (0, eI.Optional)(),
        __metadata("design:type", Object),
      ],
      rO.prototype,
      "clientInfoProvider",
      void 0,
    ),
    __decorate(
      [
        (0, eI.Autowired)(ev.AuthenticationManager),
        (0, eI.Optional)(),
        __metadata("design:type", Object),
      ],
      rO.prototype,
      "authenticationManager",
      void 0,
    ),
    __decorate(
      [
        (0, eI.Autowired)(eQ.TracerProvider),
        (0, eI.Optional)(),
        __metadata("design:type", Object),
      ],
      rO.prototype,
      "tracerProvider",
      void 0,
    ),
    (rO = eC =
      __decorate(
        [(0, eI.Component)(eB.GalileoService, eI.ApplicationLifecycle)],
        rO,
      )));
  return {
    GalileoService: eB.GalileoService,
    GalileoServiceImpl: rO,
    isGalileoOtlpRequest,
  };
}

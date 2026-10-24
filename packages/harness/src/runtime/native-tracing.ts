// @ts-nocheck
// Complete original tracing service, provider and helper factories; no implicit activation.
export const TRACING_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const TRACING_MODULES = [
  [79645, 15763149, 15764767],
  [1423, 15764768, 15765900],
  [97584, 15756912, 15757266],
  [94668, 15755207, 15756911],
  [801, 15757267, 15763148],
  [63984, 15732046, 15734822],
  [11484, 15729712, 15730251],
  [86504, 15731212, 15732045],
] as const;
export function createNativeTracing(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit tracing process boundary required");
  const process = runtime.process,
    Date = runtime.Date ?? globalThis.Date,
    Reflect = runtime.Reflect ?? globalThis.Reflect,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout;
  const factories = {
    79645(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__decorate) ||
          function (eA, el, ec, eu) {
            var ed,
              ep = arguments.length,
              eg =
                ep < 3
                  ? el
                  : null === eu
                    ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                    : eu;
            if (
              "object" == typeof Reflect &&
              "function" == typeof Reflect.decorate
            )
              eg = Reflect.decorate(eA, el, ec, eu);
            else
              for (var eh = eA.length - 1; eh >= 0; eh--)
                (ed = eA[eh]) &&
                  (eg =
                    (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                    eg);
            return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
          },
        ed =
          (this && this.__metadata) ||
          function (eA, el) {
            if (
              "object" == typeof Reflect &&
              "function" == typeof Reflect.metadata
            )
              return Reflect.metadata(eA, el);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.TraceServiceImpl = void 0));
      let ep = ec(80699),
        eg = ec(97584),
        eh = 100,
        ef = class {
          constructor() {
            ((this.traces = new Map()), (this.traceList = []));
          }
          get activeTracer() {
            return this.tracerProvider.getTracer();
          }
          getTrace(eA) {
            return this.traces.get(eA);
          }
          async restart(eA) {
            (await this.shutdown(), await this.init(eA));
          }
          async shutdown() {
            (await this.forceFlush(), await this.tracerProvider.shutdown());
          }
          async forceFlush() {
            await this.tracerProvider.forceFlush();
          }
          async init(eA) {
            await this.tracerProvider.init(eA);
          }
          startTrace(eA, el, ec, eu) {
            if (el && this.traces.has(el)) return this.traces.get(el).span;
            let ed = this.tracerProvider.createTrace(el, eu),
              ep = ed.startSpan(eA, ec, eu);
            return (this.setTrace(ed.traceId, ed), ep);
          }
          setTrace(eA, el) {
            if (
              (this.traces.set(eA, el),
              this.traceList.push(eA),
              this.traceList.length > eh)
            ) {
              let eA = this.traceList.shift();
              this.traces.delete(eA);
            }
          }
        };
      ((el.TraceServiceImpl = ef),
        eu(
          [(0, ep.Autowired)(eg.TracerProvider), ed("design:type", Object)],
          ef.prototype,
          "tracerProvider",
          void 0,
        ),
        (el.TraceServiceImpl = eu([(0, ep.Component)(eg.TraceService)], ef)));
    },
    1423(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.EmptyTrace = el.OpenTelemetryTrace = void 0));
      let eu = ec(47763),
        ed = ec(94668);
      let OpenTelemetryTrace = class OpenTelemetryTrace {
        constructor(eA, el, ec, eu) {
          ((this.tracer = eA),
            (this._traceId = el),
            (this.idGenerator = ec),
            (this._parentSpanId = eu));
        }
        startSpan(eA, el, ec) {
          let ep;
          this._traceId &&
            this.idGenerator &&
            this.idGenerator.setNextTraceId(this._traceId);
          let eg = ec || this._parentSpanId;
          if (eg && this._traceId) {
            let eA = {
              traceId: this._traceId,
              spanId: eg,
              traceFlags: eu.TraceFlags.SAMPLED,
              isRemote: !0,
            };
            ep = eu.trace.setSpanContext(eu.ROOT_CONTEXT, eA);
          }
          let eh = this.tracer.startSpan(
            eA,
            { ...el, kind: eu.SpanKind.CLIENT, startTime: Date.now() },
            ep,
          );
          return (
            (this.rootSpan = new ed.OpenTelemetrySpan(
              this.tracer,
              eh,
              void 0,
              eg || void 0,
            )),
            (this._traceId = eh.spanContext().traceId),
            this.rootSpan
          );
        }
        get traceId() {
          var eA;
          return null != (eA = this._traceId) ? eA : "";
        }
        get span() {
          return this.rootSpan;
        }
      };
      el.OpenTelemetryTrace = OpenTelemetryTrace;
      let EmptyTrace = class EmptyTrace {
        get traceId() {
          return "";
        }
        startSpan(eA, el, ec) {
          return ((this.rootSpan = new ed.EmptySpan()), this.rootSpan);
        }
        get span() {
          return this.rootSpan;
        }
      };
      el.EmptyTrace = EmptyTrace;
    },
    97584(eA, el) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.OtlpProxyAgentInjector =
          el.TracerProvider =
          el.ResourcesProvider =
          el.TraceService =
            void 0),
        (el.TraceService = Symbol("TraceService")),
        (el.ResourcesProvider = Symbol("ResourcesProvider")),
        (el.TracerProvider = Symbol("TracerProvider")),
        (el.OtlpProxyAgentInjector = Symbol("OtlpProxyAgentInjector")));
    },
    94668(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.EmptySpan = el.OpenTelemetrySpan = void 0));
      let eu = ec(51147),
        ed = ec(47763);
      let OpenTelemetrySpan = class OpenTelemetrySpan {
        constructor(eA, el, ec, eu) {
          ((this.tracer = eA),
            (this.span = el),
            (this.parent = ec),
            (this.remoteParentSpanId = eu));
        }
        startSpan(eA, el) {
          let ec = this.tracer.startSpan(
            eA,
            { kind: ed.SpanKind.CLIENT, ...el },
            ed.trace.setSpan(ed.context.active(), this.span),
          );
          return new OpenTelemetrySpan(this.tracer, ec, this.span);
        }
        setTraceId(eA) {}
        markAsUnset(eA) {
          (this.span.setStatus({ code: ed.SpanStatusCode.UNSET }),
            this.span.end(eA));
        }
        markAsFailed(eA, el) {
          (eA && this.recordException(eA, el),
            this.span.setStatus({ code: ed.SpanStatusCode.ERROR }),
            this.span.end(el));
        }
        markAsSuccessful(eA) {
          (this.span.setStatus({ code: ed.SpanStatusCode.OK }),
            this.span.end(eA));
        }
        setAttributes(eA) {
          this.span.setAttributes(eA);
        }
        addEvent(eA, el, ec) {
          this.span.addEvent(eA, el, ec);
        }
        recordException(eA, el) {
          this.span.recordException(eA, el);
        }
        get traceId() {
          return this.span.spanContext().traceId;
        }
        get requestHeaders() {
          var eA, el, ec, ed;
          let {
              traceId: ep,
              spanId: eg,
              traceFlags: eh,
            } = this.span.spanContext(),
            ef =
              null !=
              (ed =
                null !=
                (ec =
                  null !=
                  (el =
                    null == (eA = this.parent)
                      ? void 0
                      : eA.spanContext().spanId)
                    ? el
                    : this.remoteParentSpanId)
                  ? ec
                  : this.span.parentSpanId)
                ? ed
                : "";
          return {
            [eu.TRACE_ID_HEADER]: ep,
            b3: `${ep}-${eg}-${eh}-${ef}`,
            "X-B3-TraceId": ep,
            "X-B3-ParentSpanId": ef,
            "X-B3-SpanId": eg,
            "X-B3-Sampled": String(eh),
          };
        }
      };
      el.OpenTelemetrySpan = OpenTelemetrySpan;
      let EmptySpan = class EmptySpan {
        get traceId() {
          return "";
        }
        get requestHeaders() {
          return {};
        }
        startSpan() {
          return new EmptySpan();
        }
        markAsUnset(eA) {}
        markAsFailed(eA, el) {}
        markAsSuccessful(eA) {}
        setTraceId(eA) {}
        addEvent(eA, el) {}
        setAttributes(eA) {}
        recordException(eA, el) {}
      };
      el.EmptySpan = EmptySpan;
    },
    801(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__decorate) ||
          function (eA, el, ec, eu) {
            var ed,
              ep = arguments.length,
              eg =
                ep < 3
                  ? el
                  : null === eu
                    ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                    : eu;
            if (
              "object" == typeof Reflect &&
              "function" == typeof Reflect.decorate
            )
              eg = Reflect.decorate(eA, el, ec, eu);
            else
              for (var eh = eA.length - 1; eh >= 0; eh--)
                (ed = eA[eh]) &&
                  (eg =
                    (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                    eg);
            return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
          },
        ed =
          (this && this.__metadata) ||
          function (eA, el) {
            if (
              "object" == typeof Reflect &&
              "function" == typeof Reflect.metadata
            )
              return Reflect.metadata(eA, el);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.TracerProviderImpl = void 0));
      let ep = ec(80699),
        eg = ec(9151),
        eh = ec(47763),
        ef = ec(13896),
        em = ec(85081),
        eE = ec(89752),
        eC = ec(11484),
        ey = ec(86504),
        ew = ec(63984),
        eB = ec(1423),
        e_ = ec(97584),
        eI = "service.name",
        ev = "service.version",
        eS = "coding-copilot-tracer",
        eQ = "1.0.0",
        eD = class {
          constructor() {
            ((this.path = "/v1/traces"),
              (this.useGlobalProvider = !1),
              (this.idGenerator = new eC.DeterministicIdGenerator()));
          }
          async forceFlush() {
            var eA;
            if (this.useGlobalProvider) {
              let eA = this.getGlobalProviderDelegate();
              (null == eA ? void 0 : eA.forceFlush)
                ? (await eA.forceFlush(),
                  this.logger.info(
                    "Galileo global OpenTelemetry provider forceFlush completed.",
                  ))
                : this.logger.warn(
                    "Galileo global OpenTelemetry provider has no forceFlush delegate; skip forceFlush.",
                  );
              return;
            }
            await (null == (eA = this.provider) ? void 0 : eA.forceFlush());
          }
          async shutdown() {
            var eA;
            this.useGlobalProvider ||
              (await (null == (eA = this.provider) ? void 0 : eA.shutdown()));
          }
          createTrace(eA, el) {
            return this.tracer
              ? new eB.OpenTelemetryTrace(this.tracer, eA, this.idGenerator, el)
              : new eB.EmptyTrace();
          }
          async init(eA) {
            var el, ec, eu, ed, ep;
            this.logger.setContext("TracingService");
            let eg = await this.productManager.waitConfiguration(),
              { endpoint: ef, telemetry: eC } = eg,
              ey = null == eC ? void 0 : eC.tracing,
              eB = (0, ew.readOtelTraceEnv)();
            for (let eA of eB.warnings) this.logger.warn(eA);
            let e_ = (null == ey ? void 0 : ey.enabled) === !0,
              eD =
                (null == (el = null == eg ? void 0 : eg.galileo)
                  ? void 0
                  : el.enable) === !0;
            if (!e_ && !eB.enabledByEnv && !eD)
              return void this.logger.warn("Tracing is disabled");
            let eT =
                null !=
                (eu =
                  null != (ec = eB.serviceName)
                    ? ec
                    : null == eA
                      ? void 0
                      : eA.serviceName)
                  ? eu
                  : eS,
              eR =
                null != (ed = null == eA ? void 0 : eA.serviceVersion)
                  ? ed
                  : eQ;
            if (eD) {
              ((this.useGlobalProvider = !0),
                (this.provider = void 0),
                (this.tracer = eh.trace.getTracer(eT, eR)),
                this.logger.info(
                  "Tracing uses @tencent/galileo-node-sdk global OpenTelemetry provider; @genie OTLP exporter is skipped.",
                ),
                this.logger.info(
                  `Tracing config resolved: ${JSON.stringify({ productEnabled: e_, enabledByEnv: eB.enabledByEnv, endpoint: ef, galileoEnabled: !0 })}`,
                ));
              return;
            }
            this.useGlobalProvider = !1;
            try {
              let eA = this.buildSpanExporter(
                eB,
                null == ey ? void 0 : ey.url,
                ef,
                null == ey ? void 0 : ey.headers,
              );
              if (!eA)
                return void this.logger.warn(
                  "Tracing is enabled but no exporter resolved (no endpoint configured); skip init.",
                );
              if (this.provider)
                try {
                  (await this.provider.forceFlush(),
                    await this.provider.shutdown());
                } catch (eA) {
                  this.logger.warn(
                    `Failed to flush/shutdown previous TracerProvider: ${eA}`,
                  );
                }
              let el = await this.collectResources(),
                ec = new eE.BasicTracerProvider({
                  idGenerator: this.idGenerator,
                  resource: new em.Resource({
                    [eI]: eT,
                    [ev]: eR,
                    ...el,
                    ...(null != (ep = eB.resourceAttributes) ? ep : {}),
                  }),
                  spanProcessors: this.buildSpanProcessors(eA),
                });
              (await new Promise((eA) => {
                setTimeout(() => {
                  try {
                    ec.register();
                  } catch (eA) {
                    this.logger.error(
                      `TracerProvider.register() failed: ${eA}`,
                    );
                  }
                  eA();
                }, 0);
              }),
                (this.provider = ec),
                (this.tracer = ec.getTracer(eT, eR)));
            } catch (eA) {
              this.logger.error(eA);
            }
          }
          getGlobalProviderDelegate() {
            let eA = eh.trace.getTracerProvider();
            return "function" == typeof eA.getDelegate ? eA.getDelegate() : eA;
          }
          async attachPrimaryProcessorToGlobalProvider(eA) {
            this.logger.setContext("TracingService");
            let el = eA;
            if (
              "function" != typeof (null == el ? void 0 : el.addSpanProcessor)
            )
              return void this.logger.warn(
                "Galileo dual-report skipped: global provider has no addSpanProcessor (removed in OTel >= 1.32).",
              );
            try {
              let { endpoint: eA, telemetry: ec } =
                  await this.productManager.waitConfiguration(),
                eu = null == ec ? void 0 : ec.tracing,
                ed = (0, ew.readOtelTraceEnv)(),
                ep = this.buildSpanExporter(
                  ed,
                  null == eu ? void 0 : eu.url,
                  eA,
                  null == eu ? void 0 : eu.headers,
                );
              if (!ep)
                return void this.logger.info(
                  "Galileo dual-report skipped: no primary OTLP endpoint resolved (env/product).",
                );
              (el.addSpanProcessor(
                new eE.BatchSpanProcessor(
                  new ey.LoggingSpanExporter(ep, this.logger, "primary"),
                ),
              ),
                this.logger.info(
                  "Galileo dual-report enabled: primary OTLP processor attached to global provider.",
                ));
            } catch (eA) {
              this.logger.warn(
                `Galileo dual-report failed to attach primary processor: ${eA}`,
              );
            }
          }
          buildSpanProcessors(eA) {
            return [
              new eE.BatchSpanProcessor(
                new ey.LoggingSpanExporter(eA, this.logger, "primary"),
              ),
            ];
          }
          buildSpanExporter(eA, el, ec, eu) {
            var ed, ep, eg;
            if ("none" === eA.exporter) return;
            if ("console" === eA.exporter) return new eE.ConsoleSpanExporter();
            let eh =
              null != (ep = null != (ed = eA.endpoint) ? ed : el)
                ? ep
                : ec
                  ? `${ec}${this.path}`
                  : void 0;
            if (!eh) return;
            let em = {
                Connection: "keep-alive",
                ...(null != eu ? eu : {}),
                ...(null != (eg = eA.headers) ? eg : {}),
              },
              eC = new ef.OTLPTraceExporter({
                url: eh,
                keepAlive: !0,
                headers: em,
              });
            return (this.attachProxyAgentIfNeeded(eC, eh), eC);
          }
          attachProxyAgentIfNeeded(eA, el) {
            let ec = this.proxyInjector;
            if (ec)
              try {
                ec.attachIfNeeded(eA, el);
              } catch (eA) {
                this.logger.warn(
                  `Failed to attach proxy agent for OTLP traces: ${eA}`,
                );
              }
          }
          getTracer() {
            return this.tracer;
          }
          async collectResources() {
            let eA = {};
            for (let el of this.resourcesProviders.get()) {
              let ec = await el.provide();
              ec && Object.assign(eA, ec);
            }
            return eA;
          }
        };
      ((el.TracerProviderImpl = eD),
        eu(
          [(0, ep.Autowired)(ep.Logger), ed("design:type", Object)],
          eD.prototype,
          "logger",
          void 0,
        ),
        eu(
          [(0, ep.Autowired)(eg.ProductManager), ed("design:type", Object)],
          eD.prototype,
          "productManager",
          void 0,
        ),
        eu(
          [
            (0, ep.AutowiredProvider)(e_.ResourcesProvider),
            ed("design:type", Object),
          ],
          eD.prototype,
          "resourcesProviders",
          void 0,
        ),
        eu(
          [
            (0, ep.Autowired)(e_.OtlpProxyAgentInjector),
            (0, ep.Optional)(),
            ed("design:type", Object),
          ],
          eD.prototype,
          "proxyInjector",
          void 0,
        ),
        (el.TracerProviderImpl = eu(
          [(0, ep.Component)(e_.TracerProvider)],
          eD,
        )));
    },
    63984(eA, el) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.readOtelTraceEnv =
          el.readGalileoViewSpanEnabled =
          el.readOtelLoggingFlags =
          el.parseKeyValueList =
            void 0));
      let ec = "/v1/traces",
        eu = new Set(["1", "true", "yes", "on"]);
      function isTruthy(eA) {
        return eu.has((null != eA ? eA : "").trim().toLowerCase());
      }
      function readEnableFlag(eA) {
        var el;
        let ec =
          null != (el = eA.CODEBUDDY_CODE_ENABLE_TELEMETRY)
            ? el
            : eA.CLAUDE_CODE_ENABLE_TELEMETRY;
        return void 0 !== ec && isTruthy(ec);
      }
      function readExporter(eA, el) {
        let ec = eA.OTEL_TRACES_EXPORTER;
        if (!ec) return;
        let eu = ec.trim().toLowerCase();
        if ("otlp" === eu || "console" === eu || "none" === eu) return eu;
        el.push(
          `OTEL_TRACES_EXPORTER=${ec} is not supported, fallback to default. Supported: otlp, console, none.`,
        );
      }
      function readEndpoint(eA) {
        var el, eu;
        let ed =
          null == (el = eA.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT)
            ? void 0
            : el.trim();
        if (ed) return stripTrailingSlash(ed);
        let ep =
          null == (eu = eA.OTEL_EXPORTER_OTLP_ENDPOINT) ? void 0 : eu.trim();
        if (ep) return `${stripTrailingSlash(ep)}${ec}`;
      }
      function stripTrailingSlash(eA) {
        return eA.endsWith("/") ? eA.slice(0, -1) : eA;
      }
      function parseKeyValueList(eA) {
        if (!eA) return;
        let el = {};
        for (let ec of eA.split(",")) {
          let eA = ec.trim();
          if (!eA) continue;
          let eu = eA.indexOf("=");
          if (eu <= 0) continue;
          let ed = eA.slice(0, eu).trim(),
            ep = eA.slice(eu + 1).trim();
          if (!ed) continue;
          let eg = ep;
          try {
            eg = decodeURIComponent(ep);
          } catch (eA) {}
          el[ed] = eg;
        }
        return 0 === Object.keys(el).length ? void 0 : el;
      }
      function readHeaders(eA) {
        var el;
        return null !=
          (el = parseKeyValueList(eA.OTEL_EXPORTER_OTLP_TRACES_HEADERS))
          ? el
          : parseKeyValueList(eA.OTEL_EXPORTER_OTLP_HEADERS);
      }
      function readProtocol(eA, el) {
        var ec;
        let eu =
          null != (ec = eA.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL)
            ? ec
            : eA.OTEL_EXPORTER_OTLP_PROTOCOL;
        if (eu) {
          if ("http/protobuf" === eu.trim().toLowerCase())
            return "http/protobuf";
          el.push(
            `OTEL exporter protocol "${eu}" is not supported in current build, fallback to http/protobuf. Supported: http/protobuf.`,
          );
        }
      }
      function readOtelLoggingFlags(eA = process.env) {
        return {
          logUserPrompts: isTruthy(eA.OTEL_LOG_USER_PROMPTS),
          logToolDetails: isTruthy(eA.OTEL_LOG_TOOL_DETAILS),
          logToolContent: isTruthy(eA.OTEL_LOG_TOOL_CONTENT),
          logRawApiBodies: isTruthy(eA.OTEL_LOG_RAW_API_BODIES),
        };
      }
      ((el.parseKeyValueList = parseKeyValueList),
        (el.readOtelLoggingFlags = readOtelLoggingFlags),
        (el.readGalileoViewSpanEnabled = function (eA = process.env) {
          return (
            !eA.DISABLE_TELEMETRY &&
            !eA.DISABLE_GALILEO &&
            "false" !== eA.GALILEO_ENABLE &&
            "1" === eA.GALILEO_SDK_READY
          );
        }),
        (el.readOtelTraceEnv = function (eA = process.env) {
          var el;
          let ec = [];
          return {
            enabledByEnv: readEnableFlag(eA),
            exporter: readExporter(eA, ec),
            endpoint: readEndpoint(eA),
            headers: readHeaders(eA),
            protocol: readProtocol(eA, ec),
            serviceName:
              (null == (el = eA.OTEL_SERVICE_NAME) ? void 0 : el.trim()) ||
              void 0,
            resourceAttributes: parseKeyValueList(eA.OTEL_RESOURCE_ATTRIBUTES),
            ...readOtelLoggingFlags(eA),
            warnings: ec,
          };
        }));
    },
    11484(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.DeterministicIdGenerator = void 0));
      let eu = ec(89752);
      let DeterministicIdGenerator = class DeterministicIdGenerator {
        constructor() {
          ((this._random = new eu.RandomIdGenerator()),
            (this.generateTraceId = () => {
              if (this._nextTraceId) {
                let eA = this._nextTraceId;
                return ((this._nextTraceId = void 0), eA);
              }
              return this._random.generateTraceId();
            }),
            (this.generateSpanId = () => this._random.generateSpanId()));
        }
        setNextTraceId(eA) {
          this._nextTraceId = eA;
        }
      };
      el.DeterministicIdGenerator = DeterministicIdGenerator;
    },
    86504(eA, el) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.LoggingSpanExporter = void 0));
      let LoggingSpanExporter = class LoggingSpanExporter {
        constructor(eA, el, ec) {
          ((this.delegate = eA), (this.logger = el), (this.label = ec));
        }
        export(eA, el) {
          let ec = [...new Set(eA.map((eA) => eA.spanContext().traceId))],
            eu = eA.length;
          this.delegate.export(eA, (eA) => {
            var ed;
            (0 === eA.code
              ? this.logger.info(
                  `${this.prefix()}Exported ${eu} spans, traceIds: ${ec.join(", ")}`,
                )
              : this.logger.error(
                  `${this.prefix()}Failed to export ${eu} spans, traceIds: ${ec.join(", ")}, error: ${null == (ed = eA.error) ? void 0 : ed.message}`,
                ),
              el(eA));
          });
        }
        prefix() {
          return this.label ? `[${this.label}] ` : "";
        }
        async shutdown() {
          return this.delegate.shutdown();
        }
        async forceFlush() {
          var eA, el;
          return null == (el = (eA = this.delegate).forceFlush)
            ? void 0
            : el.call(eA);
        }
      };
      el.LoggingSpanExporter = LoggingSpanExporter;
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const mod = { exports: {} };
      cache.set(id, mod);
      factories[id](mod, mod.exports, getModule);
      return mod.exports;
    }
    const value = runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit tracing parent required: " + id);
    return value;
  }
  return {
    ...getModule(97584),
    ...getModule(79645),
    ...getModule(801),
    ...getModule(1423),
    ...getModule(94668),
    getModule,
  };
}

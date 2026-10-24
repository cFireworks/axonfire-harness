// @ts-nocheck
// Captured samplers, BatchSpanProcessor and Galileo trace registration.
export const GALILEO_TRACE_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_TRACE_REGIONS = [
  { kind: "statement", name: "compression", start: 7913545, end: 7913603 },
  {
    kind: "statement",
    name: "registerTracerProvider",
    start: 7983515,
    end: 7985327,
  },
] as const;
export const GALILEO_TRACE_MODULES = [
  [69700, 1342460, 1342793],
  [14515, 1317788, 1318002],
  [62207, 1343130, 1344758],
  [84992, 1344759, 1345675],
  [72544, 1342794, 1343129],
  [11440, 1337487, 1342459],
] as const;
export function createNativeGalileoTrace(runtime: any) {
  const factories = {
      69700(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { AlwaysOffSampler: () => ed }));
        var eu = ec(14515),
          ed = (function () {
            function AlwaysOffSampler() {}
            return (
              (AlwaysOffSampler.prototype.shouldSample = function () {
                return { decision: eu.SamplingDecision.NOT_RECORD };
              }),
              (AlwaysOffSampler.prototype.toString = function () {
                return "AlwaysOffSampler";
              }),
              AlwaysOffSampler
            );
          })();
      },
      14515(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { SamplingDecision: () => eu }),
          (function (eA) {
            ((eA[(eA.NOT_RECORD = 0)] = "NOT_RECORD"),
              (eA[(eA.RECORD = 1)] = "RECORD"),
              (eA[(eA.RECORD_AND_SAMPLED = 2)] = "RECORD_AND_SAMPLED"));
          })(eu || (eu = {})));
      },
      62207(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { ParentBasedSampler: () => em }));
        var eu = ec(23258),
          ed = ec(71664),
          ep = ec(14138),
          eg = ec(60002),
          eh = ec(69700),
          ef = ec(72544),
          em = (function () {
            function ParentBasedSampler(eA) {
              var el, ec, eu, ed;
              ((this._root = eA.root),
                this._root ||
                  ((0, eg.globalErrorHandler)(
                    Error(
                      "ParentBasedSampler must have a root sampler configured",
                    ),
                  ),
                  (this._root = new ef.AlwaysOnSampler())),
                (this._remoteParentSampled =
                  null != (el = eA.remoteParentSampled)
                    ? el
                    : new ef.AlwaysOnSampler()),
                (this._remoteParentNotSampled =
                  null != (ec = eA.remoteParentNotSampled)
                    ? ec
                    : new eh.AlwaysOffSampler()),
                (this._localParentSampled =
                  null != (eu = eA.localParentSampled)
                    ? eu
                    : new ef.AlwaysOnSampler()),
                (this._localParentNotSampled =
                  null != (ed = eA.localParentNotSampled)
                    ? ed
                    : new eh.AlwaysOffSampler()));
            }
            return (
              (ParentBasedSampler.prototype.shouldSample = function (
                eA,
                el,
                ec,
                eg,
                eh,
                ef,
              ) {
                var em = eu.trace.getSpanContext(eA);
                return em && (0, ed.isSpanContextValid)(em)
                  ? em.isRemote
                    ? em.traceFlags & ep.TraceFlags.SAMPLED
                      ? this._remoteParentSampled.shouldSample(
                          eA,
                          el,
                          ec,
                          eg,
                          eh,
                          ef,
                        )
                      : this._remoteParentNotSampled.shouldSample(
                          eA,
                          el,
                          ec,
                          eg,
                          eh,
                          ef,
                        )
                    : em.traceFlags & ep.TraceFlags.SAMPLED
                      ? this._localParentSampled.shouldSample(
                          eA,
                          el,
                          ec,
                          eg,
                          eh,
                          ef,
                        )
                      : this._localParentNotSampled.shouldSample(
                          eA,
                          el,
                          ec,
                          eg,
                          eh,
                          ef,
                        )
                  : this._root.shouldSample(eA, el, ec, eg, eh, ef);
              }),
              (ParentBasedSampler.prototype.toString = function () {
                return (
                  "ParentBased{root=" +
                  this._root.toString() +
                  ", remoteParentSampled=" +
                  this._remoteParentSampled.toString() +
                  ", remoteParentNotSampled=" +
                  this._remoteParentNotSampled.toString() +
                  ", localParentSampled=" +
                  this._localParentSampled.toString() +
                  ", localParentNotSampled=" +
                  this._localParentNotSampled.toString() +
                  "}"
                );
              }),
              ParentBasedSampler
            );
          })();
      },
      84992(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { TraceIdRatioBasedSampler: () => ep }));
        var eu = ec(71664),
          ed = ec(14515),
          ep = (function () {
            function TraceIdRatioBasedSampler(eA) {
              (void 0 === eA && (eA = 0),
                (this._ratio = eA),
                (this._ratio = this._normalize(eA)),
                (this._upperBound = Math.floor(0xffffffff * this._ratio)));
            }
            return (
              (TraceIdRatioBasedSampler.prototype.shouldSample = function (
                eA,
                el,
              ) {
                return {
                  decision:
                    (0, eu.isValidTraceId)(el) &&
                    this._accumulate(el) < this._upperBound
                      ? ed.SamplingDecision.RECORD_AND_SAMPLED
                      : ed.SamplingDecision.NOT_RECORD,
                };
              }),
              (TraceIdRatioBasedSampler.prototype.toString = function () {
                return "TraceIdRatioBased{" + this._ratio + "}";
              }),
              (TraceIdRatioBasedSampler.prototype._normalize = function (eA) {
                return "number" != typeof eA || isNaN(eA)
                  ? 0
                  : eA >= 1
                    ? 1
                    : eA <= 0
                      ? 0
                      : eA;
              }),
              (TraceIdRatioBasedSampler.prototype._accumulate = function (eA) {
                for (var el = 0, ec = 0; ec < eA.length / 8; ec++) {
                  var eu = 8 * ec;
                  el = (el ^ parseInt(eA.slice(eu, eu + 8), 16)) >>> 0;
                }
                return el;
              }),
              TraceIdRatioBasedSampler
            );
          })();
      },
      72544(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { AlwaysOnSampler: () => ed }));
        var eu = ec(14515),
          ed = (function () {
            function AlwaysOnSampler() {}
            return (
              (AlwaysOnSampler.prototype.shouldSample = function () {
                return { decision: eu.SamplingDecision.RECORD_AND_SAMPLED };
              }),
              (AlwaysOnSampler.prototype.toString = function () {
                return "AlwaysOnSampler";
              }),
              AlwaysOnSampler
            );
          })();
      },
      11440(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { BatchSpanProcessor: () => eB }));
        var eu = ec(2339),
          ed = ec(14138),
          ep = ec(33835),
          eg = ec(7e4),
          eh = ec(30460),
          ef = ec(65890),
          em = ec(36275),
          eE = ec(60002),
          eC = ec(61549),
          ey = (function () {
            function BatchSpanProcessorBase(eA, el) {
              ((this._exporter = eA),
                (this._isExporting = !1),
                (this._finishedSpans = []),
                (this._droppedSpansCount = 0));
              var ec = (0, eg.getEnv)();
              ((this._maxExportBatchSize =
                "number" == typeof (null == el ? void 0 : el.maxExportBatchSize)
                  ? el.maxExportBatchSize
                  : ec.OTEL_BSP_MAX_EXPORT_BATCH_SIZE),
                (this._maxQueueSize =
                  "number" == typeof (null == el ? void 0 : el.maxQueueSize)
                    ? el.maxQueueSize
                    : ec.OTEL_BSP_MAX_QUEUE_SIZE),
                (this._scheduledDelayMillis =
                  "number" ==
                  typeof (null == el ? void 0 : el.scheduledDelayMillis)
                    ? el.scheduledDelayMillis
                    : ec.OTEL_BSP_SCHEDULE_DELAY),
                (this._exportTimeoutMillis =
                  "number" ==
                  typeof (null == el ? void 0 : el.exportTimeoutMillis)
                    ? el.exportTimeoutMillis
                    : ec.OTEL_BSP_EXPORT_TIMEOUT),
                (this._shutdownOnce = new eh.BindOnceFuture(
                  this._shutdown,
                  this,
                )),
                this._maxExportBatchSize > this._maxQueueSize &&
                  (eu.diag.warn(
                    "BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize",
                  ),
                  (this._maxExportBatchSize = this._maxQueueSize)));
            }
            return (
              (BatchSpanProcessorBase.prototype.forceFlush = function () {
                return this._shutdownOnce.isCalled
                  ? this._shutdownOnce.promise
                  : this._flushAll();
              }),
              (BatchSpanProcessorBase.prototype.onStart = function (eA, el) {}),
              (BatchSpanProcessorBase.prototype.onEnd = function (eA) {
                this._shutdownOnce.isCalled ||
                  ((eA.spanContext().traceFlags & ed.TraceFlags.SAMPLED) != 0 &&
                    this._addToBuffer(eA));
              }),
              (BatchSpanProcessorBase.prototype.shutdown = function () {
                return this._shutdownOnce.call();
              }),
              (BatchSpanProcessorBase.prototype._shutdown = function () {
                var eA = this;
                return Promise.resolve()
                  .then(function () {
                    return eA.onShutdown();
                  })
                  .then(function () {
                    return eA._flushAll();
                  })
                  .then(function () {
                    return eA._exporter.shutdown();
                  });
              }),
              (BatchSpanProcessorBase.prototype._addToBuffer = function (eA) {
                if (this._finishedSpans.length >= this._maxQueueSize) {
                  (0 === this._droppedSpansCount &&
                    eu.diag.debug("maxQueueSize reached, dropping spans"),
                    this._droppedSpansCount++);
                  return;
                }
                (this._droppedSpansCount > 0 &&
                  (eu.diag.warn(
                    "Dropped " +
                      this._droppedSpansCount +
                      " spans because maxQueueSize reached",
                  ),
                  (this._droppedSpansCount = 0)),
                  this._finishedSpans.push(eA),
                  this._maybeStartTimer());
              }),
              (BatchSpanProcessorBase.prototype._flushAll = function () {
                var eA = this;
                return new Promise(function (el, ec) {
                  for (
                    var eu = [],
                      ed = Math.ceil(
                        eA._finishedSpans.length / eA._maxExportBatchSize,
                      ),
                      ep = 0,
                      eg = ed;
                    ep < eg;
                    ep++
                  )
                    eu.push(eA._flushOneBatch());
                  Promise.all(eu)
                    .then(function () {
                      el();
                    })
                    .catch(ec);
                });
              }),
              (BatchSpanProcessorBase.prototype._flushOneBatch = function () {
                var eA = this;
                return (this._clearTimer(), 0 === this._finishedSpans.length)
                  ? Promise.resolve()
                  : new Promise(function (el, ec) {
                      var eu = setTimeout(function () {
                        ec(Error("Timeout"));
                      }, eA._exportTimeoutMillis);
                      ep.context.with(
                        (0, ef.suppressTracing)(ep.context.active()),
                        function () {
                          eA._finishedSpans.length <= eA._maxExportBatchSize
                            ? ((ed = eA._finishedSpans),
                              (eA._finishedSpans = []))
                            : (ed = eA._finishedSpans.splice(
                                0,
                                eA._maxExportBatchSize,
                              ));
                          for (
                            var ed,
                              doExport = function () {
                                return eA._exporter.export(ed, function (eA) {
                                  var ed;
                                  (clearTimeout(eu),
                                    eA.code === em.ExportResultCode.SUCCESS
                                      ? el()
                                      : ec(
                                          null != (ed = eA.error)
                                            ? ed
                                            : Error(
                                                "BatchSpanProcessor: span export failed",
                                              ),
                                        ));
                                });
                              },
                              ep = null,
                              eg = 0,
                              eh = ed.length;
                            eg < eh;
                            eg++
                          ) {
                            var ef = ed[eg];
                            ef.resource.asyncAttributesPending &&
                              ef.resource.waitForAsyncAttributes &&
                              (null != ep || (ep = []),
                              ep.push(ef.resource.waitForAsyncAttributes()));
                          }
                          null === ep
                            ? doExport()
                            : Promise.all(ep).then(doExport, function (eA) {
                                ((0, eE.globalErrorHandler)(eA), ec(eA));
                              });
                        },
                      );
                    });
              }),
              (BatchSpanProcessorBase.prototype._maybeStartTimer = function () {
                var eA = this;
                if (!this._isExporting) {
                  var flush = function () {
                    ((eA._isExporting = !0),
                      eA
                        ._flushOneBatch()
                        .finally(function () {
                          ((eA._isExporting = !1),
                            eA._finishedSpans.length > 0 &&
                              (eA._clearTimer(), eA._maybeStartTimer()));
                        })
                        .catch(function (el) {
                          ((eA._isExporting = !1),
                            (0, eE.globalErrorHandler)(el));
                        }));
                  };
                  if (this._finishedSpans.length >= this._maxExportBatchSize)
                    return flush();
                  void 0 === this._timer &&
                    ((this._timer = setTimeout(function () {
                      return flush();
                    }, this._scheduledDelayMillis)),
                    (0, eC.unrefTimer)(this._timer));
                }
              }),
              (BatchSpanProcessorBase.prototype._clearTimer = function () {
                void 0 !== this._timer &&
                  (clearTimeout(this._timer), (this._timer = void 0));
              }),
              BatchSpanProcessorBase
            );
          })(),
          ew = (function () {
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
          eB = (function (eA) {
            function BatchSpanProcessor() {
              return (null !== eA && eA.apply(this, arguments)) || this;
            }
            return (
              ew(BatchSpanProcessor, eA),
              (BatchSpanProcessor.prototype.onShutdown = function () {}),
              BatchSpanProcessor
            );
          })(ey);
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

  const eN = ec(69700),
    eP = ec(14515),
    eL = ec(62207),
    eF = ec(84992),
    eU = ec(11440),
    ej = runtime.tracerProviders,
    eG = runtime.sdk,
    eO = runtime.context,
    GalileoEncryptedTraceExporter =
      runtime.exporters.GalileoEncryptedTraceExporter;
  let eu;
  !(function (eA) {
    ((eA.NONE = "none"), (eA.GZIP = "gzip"));
  })(eu || (eu = {}));
  let registerTracerProvider = (eA) => {
    let {
        resource: el,
        addr: ec,
        filter: ed,
        traceConfig: ep,
        encryption: eg,
      } = eA,
      { local: eh, remote: ef = null } = ep,
      traceSampler = () => {
        var eA, el, ec;
        if (!(null == eh ? void 0 : eh.enable))
          return new eN.AlwaysOffSampler();
        let eu =
          null !=
          (ec =
            null ==
            (el =
              null == (eA = null == eh ? void 0 : eh.processor)
                ? void 0
                : eA.sampler)
              ? void 0
              : el.fraction)
            ? ec
            : eG.TRACE_CONFIG.processor.sampler.fraction;
        return {
          shouldSample(eA, el, ec, ep, eg, em) {
            var eE, eC, ey, ew, eB, e_;
            if (
              (null == (eE = null == ed ? void 0 : ed.calleeMethod)
                ? void 0
                : eE.includes(
                    (null == eg ? void 0 : eg["trpc.callee_method"]) || "",
                  )) ||
              (null == (eC = null == ed ? void 0 : ed.callerMethod)
                ? void 0
                : eC.includes(
                    (null == eg ? void 0 : eg["trpc.caller_method"]) || "",
                  ))
            )
              return { decision: eP.SamplingDecision.NOT_RECORD };
            if (
              null ==
              (ew =
                null == (ey = null == eh ? void 0 : eh.processor)
                  ? void 0
                  : ey.sampler)
                ? void 0
                : ew.enableParentSample
            )
              return new eL.ParentBasedSampler({
                root:
                  0 === eu
                    ? new eN.AlwaysOffSampler()
                    : new eF.TraceIdRatioBasedSampler(eu),
              }).shouldSample(eA, el, ec, ep, eg, em);
            let eI = null == ef ? void 0 : ef.getData();
            return (
              null == eI
                ? void 0
                : eI.some((eA) => {
                    var el;
                    return null == (el = null == eA ? void 0 : eA.values)
                      ? void 0
                      : el.some((el) =>
                          ((null == eg ? void 0 : eg[eA.key]) || "")
                            .toString()
                            .includes(el),
                        );
                  })
            )
              ? { decision: eP.SamplingDecision.RECORD_AND_SAMPLED }
              : (
                    null ==
                    (e_ =
                      null == (eB = null == eh ? void 0 : eh.processor)
                        ? void 0
                        : eB.sampler)
                      ? void 0
                      : e_.enableRandomSample
                  )
                ? new eF.TraceIdRatioBasedSampler(eu).shouldSample(eA, el)
                : { decision: eP.SamplingDecision.NOT_RECORD };
          },
        };
      },
      em = new eU.BatchSpanProcessor(
        new GalileoEncryptedTraceExporter(
          {
            url: ec,
            concurrencyLimit: 30,
            timeoutMillis: 1e4,
            compression: eu.GZIP,
          },
          eg,
        ),
        {
          maxQueueSize: 100,
          maxExportBatchSize: 20,
          exportTimeoutMillis: 1e4,
          scheduledDelayMillis: 5e3,
        },
      ),
      eE = new ej.BasicTracerProvider({
        resource: el,
        sampler: traceSampler(),
        spanProcessors: [em],
      });
    return (
      eE.register({
        contextManager: new eO.AsyncLocalStorageContextManager().enable(),
      }),
      eE
    );
  };
  return {
    registerTracerProvider,
    AlwaysOffSampler: eN.AlwaysOffSampler,
    AlwaysOnSampler: ec(72544).AlwaysOnSampler,
    ParentBasedSampler: eL.ParentBasedSampler,
    TraceIdRatioBasedSampler: eF.TraceIdRatioBasedSampler,
    SamplingDecision: eP.SamplingDecision,
    BatchSpanProcessor: eU.BatchSpanProcessor,
    getModule: ec,
  };
}

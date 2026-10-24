// @ts-nocheck
// Captured business metric views and MetricsAPI registration.
export const GALILEO_METERS_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_METERS_REGIONS = [
  { kind: "statement", name: "compression", start: 7913545, end: 7913603 },
  { kind: "declarator", name: "getEndBuckets", start: 8043800, end: 8044102 },
  {
    kind: "declarator",
    name: "registerMeterProvider",
    start: 8044103,
    end: 8045224,
  },
] as const;
export const GALILEO_METERS_MODULES = [[37366, 978696, 979537]] as const;
export function createNativeGalileoMeters(runtime: any) {
  const factories = {
      37366(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { metrics: () => ef }));
        var eu = ec(36182),
          ed = new ((function () {
            function NoopMeterProvider() {}
            return (
              (NoopMeterProvider.prototype.getMeter = function (eA, el, ec) {
                return eu.NOOP_METER;
              }),
              NoopMeterProvider
            );
          })())(),
          ep = ec(70647),
          eg = ec(58583),
          eh = "metrics",
          ef = (function () {
            function MetricsAPI() {}
            return (
              (MetricsAPI.getInstance = function () {
                return (
                  this._instance || (this._instance = new MetricsAPI()),
                  this._instance
                );
              }),
              (MetricsAPI.prototype.setGlobalMeterProvider = function (eA) {
                return (0, ep.registerGlobal)(eh, eA, eg.DiagAPI.instance());
              }),
              (MetricsAPI.prototype.getMeterProvider = function () {
                return (0, ep.getGlobal)(eh) || ed;
              }),
              (MetricsAPI.prototype.getMeter = function (eA, el, ec) {
                return this.getMeterProvider().getMeter(eA, el, ec);
              }),
              (MetricsAPI.prototype.disable = function () {
                (0, ep.unregisterGlobal)(eh, eg.DiagAPI.instance());
              }),
              MetricsAPI
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

  const AB = runtime.readers.PeriodicExportingMetricReader,
    GalileoEncryptedMetricExporter =
      runtime.metrics.GalileoEncryptedMetricExporter,
    ep = runtime.metrics.AggregationTemporality,
    Ax = runtime.providers.View,
    tK = runtime.metrics.SumAggregation,
    tJ = runtime.metrics.ExplicitBucketHistogramAggregation,
    eg = runtime.metrics.InstrumentType,
    rl = runtime.providers.MeterProvider,
    ex = runtime.enums,
    eG = runtime.sdk,
    eT = ec(37366);
  let eu;
  !(function (eA) {
    ((eA.NONE = "none"), (eA.GZIP = "gzip"));
  })(eu || (eu = {}));
  let getEndBuckets = (eA) => {
    let { clientBuckets: el, serverBuckets: ec } = eG.METRICS_CONFIG;
    return (
      null == eA ||
        eA.forEach(({ name: eA, buckets: eu }) => {
          eu &&
            !(eu.length < 1) &&
            (eA === ex.ClientServerMetrics.ClientHandledSeconds
              ? (el = eu)
              : eA === ex.ClientServerMetrics.ServerHandledSeconds &&
                (ec = eu));
        }),
      { clientBuckets: el, serverBuckets: ec }
    );
  };
  let registerMeterProvider = (eA) => {
    let { remote: el } = eA,
      ec = [
        new AB({
          exporter: new GalileoEncryptedMetricExporter(
            {
              temporalityPreference: ep.DELTA,
              url: eA.addr,
              concurrencyLimit: 30,
              compression: eu.GZIP,
            },
            eA.encryption,
          ),
          exportIntervalMillis: 3e4,
          exportTimeoutMillis: 2e4,
        }),
      ],
      { clientBuckets: ed, serverBuckets: eh } = getEndBuckets(
        el.getMetricsConfig(),
      ),
      ef = [
        new Ax({
          instrumentName: ex.ClientServerMetrics.ClientHandledSeconds,
          aggregation: new tJ(ed),
          instrumentType: eg.HISTOGRAM,
        }),
        new Ax({
          instrumentName: ex.ClientServerMetrics.ClientStartedTotal,
          aggregation: new tK(),
          instrumentType: eg.COUNTER,
        }),
        new Ax({
          instrumentName: ex.ClientServerMetrics.ClientHandledTotal,
          aggregation: new tK(),
          instrumentType: eg.COUNTER,
        }),
        new Ax({
          instrumentName: ex.ClientServerMetrics.ServerHandledSeconds,
          aggregation: new tJ(eh),
          instrumentType: eg.HISTOGRAM,
        }),
        new Ax({
          instrumentName: ex.ClientServerMetrics.ServerStartedTotal,
          aggregation: new tK(),
          instrumentType: eg.COUNTER,
        }),
        new Ax({
          instrumentName: ex.ClientServerMetrics.ServerHandledTotal,
          aggregation: new tK(),
          instrumentType: eg.COUNTER,
        }),
      ],
      em = new rl({ resource: eA.resource, views: ef, readers: ec });
    return (eT.metrics.setGlobalMeterProvider(em), em);
  };
  return {
    registerMeterProvider,
    getEndBuckets,
    metrics: eT.metrics,
    getModule: ec,
  };
}

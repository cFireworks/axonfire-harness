// @ts-nocheck
// Captured Galileo self-monitor provider construction and resource identity.
export const GALILEO_SELF_MONITOR_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_SELF_MONITOR_REGIONS = [
  { kind: "statement", name: "compression", start: 7913545, end: 7913603 },
  {
    kind: "declarator",
    name: "registerSelfMeterProvider",
    start: 8045246,
    end: 8045738,
  },
  {
    kind: "declarator",
    name: "getSelfMeterProvider",
    start: 8052869,
    end: 8053460,
  },
] as const;
export function createNativeGalileoSelfMonitor(runtime: any) {
  const AB = runtime.readers.PeriodicExportingMetricReader,
    GalileoEncryptedMetricExporter =
      runtime.metrics.GalileoEncryptedMetricExporter,
    ep = runtime.metrics.AggregationTemporality,
    Ax = runtime.providers.View,
    tK = runtime.metrics.SumAggregation,
    eg = runtime.metrics.InstrumentType,
    rl = runtime.providers.MeterProvider,
    eM = runtime.resources,
    ex = runtime.enums,
    eG = runtime.sdk;
  let eu;
  !(function (eA) {
    ((eA.NONE = "none"), (eA.GZIP = "gzip"));
  })(eu || (eu = {}));
  let registerSelfMeterProvider = (eA) => {
    let el = [
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
      ec = [
        new Ax({
          instrumentName: "node_instrument_start",
          aggregation: new tK(),
          instrumentType: eg.COUNTER,
        }),
        new Ax({
          instrumentName: "node_instrument_end",
          aggregation: new tK(),
          instrumentType: eg.COUNTER,
        }),
      ];
    return new rl({ resource: eA.resource, views: ec, readers: el });
  };
  let getSelfMeterProvider = (eA, el, ec, eu) =>
    registerSelfMeterProvider({
      resource: new eM.Resource({
        [ex.GalileoResourceAttributes.Target]: "PCG-123.galileo.otp",
        [ex.GalileoResourceAttributes.ServiceName]: "galileo.otp",
        [ex.GalileoResourceAttributes.Namespace]: ex.NamespaceValues.Production,
        [ex.GalileoResourceAttributes.EnvName]:
          eA === ex.NamespaceValues.Production ? ex.EnvNameValues.Formal : el,
        [ex.GalileoResourceAttributes.Version]: eG.SDK_VERSION,
        [ex.GalileoResourceAttributes.Instance]: "",
        [ex.GalileoResourceAttributes.ContainerName]: "",
        [ex.GalileoResourceAttributes.ConSetid]: "",
      }),
      addr: ec,
      encryption: eu,
    });
  return { registerSelfMeterProvider, getSelfMeterProvider };
}

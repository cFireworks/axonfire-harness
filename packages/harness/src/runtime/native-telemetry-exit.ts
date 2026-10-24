// @ts-nocheck
// Complete original 93441 factory, UTF-16 [7887746,7889212).
export const TELEMETRY_EXIT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export function createNativeTelemetryExit(runtime: any) {
  const Date = runtime.Date ?? globalThis.Date,
    Math = runtime.Math ?? globalThis.Math,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const factories = {
    93441(eA, el, ec) {
      "use strict";
      let eu;
      (ec.r(el),
        ec.d(el, {
          _resetFlushPromiseForTest: () => _resetFlushPromiseForTest,
          flushTelemetryBeforeExit: () => flushTelemetryBeforeExit,
          shutdownTelemetryBeforeExit: () => shutdownTelemetryBeforeExit,
        }));
      var ed = ec(80699),
        ep = ec(92735),
        eg = ec(8395);
      async function flushTelemetryBeforeExit(eA = 2e3) {
        if (eA <= 0) return;
        let el = Date.now() + eA,
          remain = () => Math.max(0, el - Date.now()),
          ec = [];
        (ec.push(
          (async () => {
            try {
              let eA = ed.ContainerUtil.get(eg.AgentMetricsAggregator);
              await eA.flushOnly(Math.floor(0.8 * remain()));
            } catch {}
          })(),
        ),
          ec.push(
            (async () => {
              try {
                let eA = ed.ContainerUtil.get(ep.TraceService);
                await withTimeout(eA.forceFlush(), remain());
              } catch {}
            })(),
          ),
          await withTimeout(Promise.all(ec), eA));
      }
      function shutdownTelemetryBeforeExit(eA = 2e3) {
        return eu || (eu = doShutdown(eA));
      }
      async function doShutdown(eA) {
        if (eA <= 0) return;
        let el = Date.now() + eA,
          remain = () => Math.max(0, el - Date.now()),
          ec = [];
        (ec.push(
          (async () => {
            try {
              let eA = ed.ContainerUtil.get(eg.AgentMetricsAggregator);
              await eA.flushAndShutdown(Math.floor(0.8 * remain()));
            } catch {}
          })(),
        ),
          ec.push(
            (async () => {
              try {
                let eA = ed.ContainerUtil.get(ep.TraceService);
                await withTimeout(eA.forceFlush(), remain());
              } catch {}
            })(),
          ),
          await withTimeout(Promise.all(ec), eA));
      }
      function withTimeout(eA, el) {
        return el <= 0
          ? Promise.resolve()
          : new Promise((ec) => {
              let eu = setTimeout(() => ec(), el);
              ("function" == typeof eu.unref && eu.unref(),
                Promise.resolve(eA).then(
                  (eA) => {
                    (clearTimeout(eu), ec(eA));
                  },
                  () => {
                    (clearTimeout(eu), ec());
                  },
                ));
            });
      }
      function _resetFlushPromiseForTest() {
        eu = void 0;
      }
    },
  };
  const ec = (id: number) => {
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit telemetry exit parent required: " + id);
    return value;
  };
  ec.r = (o: any) => {
    Object.defineProperty(o, "__esModule", { value: true });
    Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
  };
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  const exports: any = {};
  factories[93441]({}, exports, ec);
  return exports;
}

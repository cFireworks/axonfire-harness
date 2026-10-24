// @ts-nocheck
// Original product-level Galileo routing policy; independent of remote SDK config polling.
export const GALILEO_CONFIG_RESOLVER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_CONFIG_RESOLVER_MODULES = [
  [73620, 15619235, 15620763],
] as const;
export function createNativeGalileoConfigResolver() {
  const factories = {
    73620(eA, el) {
      "use strict";
      function normalizeNonEmpty(eA) {
        return "string" == typeof eA && eA.trim() ? eA.trim() : void 0;
      }
      function normalizeGalileoEndpoint(eA) {
        let el = normalizeNonEmpty(eA);
        if (el)
          try {
            let eA = new URL(el);
            if (
              ("https:" !== eA.protocol && "http:" !== eA.protocol) ||
              eA.username ||
              eA.password ||
              eA.search ||
              eA.hash ||
              !/^\/*$/.test(eA.pathname)
            )
              return;
            return eA.origin;
          } catch (eA) {
            return;
          }
      }
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.resolveGalileoConfig = void 0),
        (el.resolveGalileoConfig = function (eA, el = {}) {
          var ec;
          let eu = (null == eA ? void 0 : eA.enable) === !0;
          if (!eu)
            return {
              enabled: !1,
              canExportOtlp: !1,
              canExportAegis: !1,
              fingerprint: "disabled",
              issues: [],
            };
          let ed = [],
            ep = normalizeGalileoEndpoint(null == eA ? void 0 : eA.endpoint),
            eg =
              null !=
              (ec = normalizeGalileoEndpoint(
                null == eA ? void 0 : eA.aegisEndpoint,
              ))
                ? ec
                : ep,
            eh = normalizeNonEmpty(null == eA ? void 0 : eA.projectId),
            ef = normalizeNonEmpty(null == eA ? void 0 : eA.app),
            em = normalizeNonEmpty(null == eA ? void 0 : eA.server),
            eE = normalizeNonEmpty(el.platform);
          (ep || ed.push("invalid-endpoint"),
            eh || ed.push("missing-project-id"),
            ef || ed.push("missing-app"),
            em || ed.push("missing-server"));
          let eC = !!ep && !!ef && !!em,
            ey = eC && !!eh,
            ew = eE && ef && em ? `${eE}.${ef}.${em}` : void 0,
            eB = JSON.stringify({
              enabled: eu,
              projectId: eh,
              endpoint: ep,
              app: ef,
              server: em,
              platform: eE,
            });
          return {
            enabled: eu,
            canExportOtlp: eC,
            canExportAegis: ey,
            projectId: eh,
            endpoint: ep,
            collectUrl: eg ? `${eg}/collect` : void 0,
            logsUrl: ep ? `${ep}/v1/logs` : void 0,
            metricsUrl: ep ? `${ep}/v1/metrics` : void 0,
            tracesUrl: ep ? `${ep}/v1/traces` : void 0,
            app: ef,
            server: em,
            target: ew,
            fingerprint: eB,
            issues: ed,
          };
        }));
    },
  };
  const module = { exports: {} };
  factories[73620](module, module.exports);
  return module.exports as {
    resolveGalileoConfig: (config: any, options?: { platform?: string }) => any;
  };
}
export const resolveGalileoConfig =
  createNativeGalileoConfigResolver().resolveGalileoConfig;

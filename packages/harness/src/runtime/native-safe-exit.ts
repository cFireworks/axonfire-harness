// @ts-nocheck
// Complete original factory 36648, UTF-16 [13359185,13359526).
export function createNativeSafeExit(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit safe-exit process boundary required");
  const process = runtime.process;
  const factories = {
    36648(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { SafeExitUtils: () => SafeExitUtils }));
      let SafeExitUtils = class SafeExitUtils {
        static exit(eA = 0) {
          if (
            process.stdin.isTTY &&
            "function" == typeof process.stdin.setRawMode
          )
            try {
              process.stdin.setRawMode(!1);
            } catch (eA) {}
          if (process.stdout.isTTY)
            try {
              process.stdout.write("\x1b[?25h");
            } catch (eA) {}
          process.exit(eA);
        }
      };
    },
  };
  const ec = {
    r(o: any) {
      Object.defineProperty(o, "__esModule", { value: true });
      Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
    },
    d(o: any, defs: any) {
      for (const k of Object.keys(defs))
        Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
    },
  };
  const exports: any = {};
  factories[36648]({}, exports, ec);
  return exports;
}

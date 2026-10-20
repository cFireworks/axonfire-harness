/** Native 8698413..8700101; prelude text is preserved, version=1. */
export class WorkflowRuntimePrelude {
  static PRELUDE_VERSION = 1;
  build(eA = 0) {
    let el = Number.isFinite(eA) ? Math.floor(eA) : 0;
    return `
"use strict";
// --- workflow runtime prelude (v${WorkflowRuntimePrelude.PRELUDE_VERSION}) ---
(function () {
    const FIXED_TIME_MS = ${el};
    const FORBIDDEN = function (which) {
        throw new Error(
            'Workflow scripts must be deterministic; ' + which +
            ' is not available in the workflow sandbox. Receive timestamps/randomness via args or sub-agent results instead.'
        );
    };
    const __OriginalDate = Date;
    function FrozenDate() {
        if (!(this instanceof FrozenDate)) {
            return new __OriginalDate(FIXED_TIME_MS).toString();
        }
        return new __OriginalDate(FIXED_TIME_MS);
    }
    Object.defineProperty(FrozenDate, 'name', { value: 'Date' });
    FrozenDate.now = function () { FORBIDDEN('Date.now()'); };
    FrozenDate.parse = function () { FORBIDDEN('Date.parse()'); };
    FrozenDate.UTC = function () { FORBIDDEN('Date.UTC()'); };
    Object.defineProperty(globalThis, 'Date', { value: FrozenDate, configurable: false, writable: false });

    const __OriginalMath = Math;
    const FrozenMath = Object.create(null);
    for (const k of Object.getOwnPropertyNames(__OriginalMath)) {
        FrozenMath[k] = __OriginalMath[k];
    }
    FrozenMath.random = function () { FORBIDDEN('Math.random()'); };
    Object.defineProperty(globalThis, 'Math', { value: FrozenMath, configurable: false, writable: false });

    Object.defineProperty(globalThis, 'performance', {
        value: Object.freeze({
            now() { FORBIDDEN('performance.now()'); }
        }),
        configurable: false,
        writable: false
    });
})();
// --- end prelude ---
`;
  }
}

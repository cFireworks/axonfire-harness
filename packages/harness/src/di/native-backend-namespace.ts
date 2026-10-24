// @ts-nocheck
// Original backend namespace barrels and crypto helper. Parent service identities remain shared.
export const BACKEND_NAMESPACE_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const BACKEND_NAMESPACE_MODULES = [
  [15062, 124077, 124689],
  [6579, 121799, 122393],
  [69066, 123497, 124076],
  [81840, 125037, 125616],
  [35306, 124826, 125036],
  [77598, 15799031, 15799088],
] as const;
export function createNativeBackendNamespace(runtime: any) {
  if (typeof runtime.require !== "function")
    throw Error("Explicit backend namespace require required");
  const require = runtime.require;
  const factories = {
    15062(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__createBinding) ||
          (Object.create
            ? function (eA, el, ec, eu) {
                void 0 === eu && (eu = ec);
                var ed = Object.getOwnPropertyDescriptor(el, ec);
                ((!ed ||
                  ("get" in ed
                    ? !el.__esModule
                    : ed.writable || ed.configurable)) &&
                  (ed = {
                    enumerable: !0,
                    get: function () {
                      return el[ec];
                    },
                  }),
                  Object.defineProperty(eA, eu, ed));
              }
            : function (eA, el, ec, eu) {
                (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
              }),
        ed =
          (this && this.__exportStar) ||
          function (eA, el) {
            for (var ec in eA)
              "default" === ec ||
                Object.prototype.hasOwnProperty.call(el, ec) ||
                eu(el, eA, ec);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ed(ec(6579), el),
        ed(ec(69066), el),
        ed(ec(81840), el));
    },
    6579(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__createBinding) ||
          (Object.create
            ? function (eA, el, ec, eu) {
                void 0 === eu && (eu = ec);
                var ed = Object.getOwnPropertyDescriptor(el, ec);
                ((!ed ||
                  ("get" in ed
                    ? !el.__esModule
                    : ed.writable || ed.configurable)) &&
                  (ed = {
                    enumerable: !0,
                    get: function () {
                      return el[ec];
                    },
                  }),
                  Object.defineProperty(eA, eu, ed));
              }
            : function (eA, el, ec, eu) {
                (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
              }),
        ed =
          (this && this.__exportStar) ||
          function (eA, el) {
            for (var ec in eA)
              "default" === ec ||
                Object.prototype.hasOwnProperty.call(el, ec) ||
                eu(el, eA, ec);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ed(ec(93772), el),
        ed(ec(96e3), el));
    },
    69066(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__createBinding) ||
          (Object.create
            ? function (eA, el, ec, eu) {
                void 0 === eu && (eu = ec);
                var ed = Object.getOwnPropertyDescriptor(el, ec);
                ((!ed ||
                  ("get" in ed
                    ? !el.__esModule
                    : ed.writable || ed.configurable)) &&
                  (ed = {
                    enumerable: !0,
                    get: function () {
                      return el[ec];
                    },
                  }),
                  Object.defineProperty(eA, eu, ed));
              }
            : function (eA, el, ec, eu) {
                (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
              }),
        ed =
          (this && this.__exportStar) ||
          function (eA, el) {
            for (var ec in eA)
              "default" === ec ||
                Object.prototype.hasOwnProperty.call(el, ec) ||
                eu(el, eA, ec);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ed(ec(30805), el));
    },
    81840(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__createBinding) ||
          (Object.create
            ? function (eA, el, ec, eu) {
                void 0 === eu && (eu = ec);
                var ed = Object.getOwnPropertyDescriptor(el, ec);
                ((!ed ||
                  ("get" in ed
                    ? !el.__esModule
                    : ed.writable || ed.configurable)) &&
                  (ed = {
                    enumerable: !0,
                    get: function () {
                      return el[ec];
                    },
                  }),
                  Object.defineProperty(eA, eu, ed));
              }
            : function (eA, el, ec, eu) {
                (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
              }),
        ed =
          (this && this.__exportStar) ||
          function (eA, el) {
            for (var ec in eA)
              "default" === ec ||
                Object.prototype.hasOwnProperty.call(el, ec) ||
                eu(el, eA, ec);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ed(ec(35306), el));
    },
    35306(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.crc32 = crc32));
      let eu = ec(77598);
      function crc32(eA) {
        let el = (0, eu.createHash)("crc32");
        return (el.update(eA, "utf8"), el.digest("hex"));
      }
    },
    77598(eA) {
      "use strict";
      eA.exports = require("node:crypto");
    },
  };
  const cache = new Map();
  function ec(id: number) {
    if (cache.has(id)) return cache.get(id).exports;
    if (!factories[id]) {
      const exports = runtime.modules?.[id] ?? runtime.getModule?.(id);
      if (exports === undefined)
        throw Error("Explicit backend namespace parent required: " + id);
      cache.set(id, { exports });
      return exports;
    }
    const module = { exports: {} };
    cache.set(id, module);
    factories[id](module, module.exports, ec);
    return module.exports;
  }
  return { load: () => ec(15062), getModule: ec };
}

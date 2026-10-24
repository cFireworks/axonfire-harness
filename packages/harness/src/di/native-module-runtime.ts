// @ts-nocheck
// Original Rspack async-module and namespace helpers, without bundle execution.
export const MODULE_RUNTIME_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const MODULE_RUNTIME_REGION = [22118069, 22120807] as const;
export function installNativeModuleRuntime(runtime: any) {
  if (typeof runtime.require !== "function" || !runtime.moduleCache)
    throw Error("Explicit module require and cache required");
  const __webpack_require__ = runtime.require,
    __webpack_module_cache__ = runtime.moduleCache;
  ((() => {
    var eA = "function" == typeof Symbol,
      el = eA ? Symbol("rspack queues") : "__rspack_queues",
      ec = (__webpack_require__.aE = eA
        ? Symbol("rspack exports")
        : "__webpack_exports__"),
      eu = eA ? Symbol("rspack error") : "__rspack_error",
      ed = eA ? Symbol("rspack done") : "__rspack_done",
      ep = (__webpack_require__.zS = eA
        ? Symbol("rspack defer")
        : "__rspack_defer"),
      resolveQueue = (eA) => {
        eA &&
          eA.d < 1 &&
          ((eA.d = 1),
          eA.forEach((eA) => eA.r--),
          eA.forEach((eA) => (eA.r-- ? eA.r++ : eA())));
      },
      wrapDeps = (eA) =>
        eA.map((eA) => {
          if (null !== eA && "object" == typeof eA) {
            if (!eA[el] && eA[ep]) {
              var eg = eA[ep];
              if (
                !eg.some((eA) => {
                  var el = __webpack_module_cache__[eA];
                  return !el || !1 === el[ed];
                })
              )
                return eA;
              var eh = eA;
              eA = {
                then(eA) {
                  Promise.all(eg.map(__webpack_require__)).then(() => eA(eh));
                },
              };
            }
            if (eA[el]) return eA;
            if (eA.then) {
              var ef = [];
              ((ef.d = 0),
                eA.then(
                  (eA) => {
                    ((em[ec] = eA), resolveQueue(ef));
                  },
                  (eA) => {
                    ((em[eu] = eA), resolveQueue(ef));
                  },
                ));
              var em = {};
              return ((em[ep] = !1), (em[el] = (eA) => eA(ef)), em);
            }
          }
          var eE = {};
          return ((eE[el] = () => {}), (eE[ec] = eA), eE);
        });
    __webpack_require__.a = (eA, eg, eh) => {
      eh && ((ef = []).d = -1);
      var ef,
        em,
        eE,
        eC,
        ey = new Set(),
        ew = eA.exports,
        eB = new Promise((eA, el) => {
          ((eC = el), (eE = eA));
        });
      ((eB[ec] = ew),
        (eB[el] = (eA) => {
          (ef && eA(ef), ey.forEach(eA), eB.catch(() => {}));
        }),
        (eA.exports = eB),
        eg(
          (eA) => {
            em = wrapDeps(eA);
            var ed,
              getResult = () =>
                em.map((eA) => {
                  if (eA[ep]) return eA;
                  if (eA[eu]) throw eA[eu];
                  return eA[ec];
                }),
              eg = new Promise((eA) => {
                (ed = () => eA(getResult)).r = 0;
                var fnQueue = (eA) =>
                  eA !== ef &&
                  !ey.has(eA) &&
                  (ey.add(eA), eA && !eA.d && (ed.r++, eA.push(ed)));
                em.map((eA) => eA[ep] || eA[el](fnQueue));
              });
            return ed.r ? eg : getResult();
          },
          (eA) => (
            eA ? eC((eB[eu] = eA)) : eE(ew),
            resolveQueue(ef),
            (eB[ed] = !0)
          ),
        ),
        ef && ef.d < 0 && (ef.d = 0));
    };
  })(),
    (() => {
      __webpack_require__.n = (eA) => {
        var el = eA && eA.__esModule ? () => eA.default : () => eA;
        return (__webpack_require__.d(el, { a: el }), el);
      };
    })(),
    (() => {
      var eA,
        el = Object.getPrototypeOf
          ? (eA) => Object.getPrototypeOf(eA)
          : (eA) => eA.__proto__;
      __webpack_require__.t = function (ec, eu) {
        if (
          (1 & eu && (ec = this(ec)),
          8 & eu ||
            ("object" == typeof ec &&
              ec &&
              ((4 & eu && ec.__esModule) ||
                (16 & eu && "function" == typeof ec.then))))
        )
          return ec;
        var ed = Object.create(null);
        __webpack_require__.r(ed);
        var ep = {};
        eA = eA || [null, el({}), el([]), el(el)];
        for (
          var eg = 2 & eu && ec;
          ("object" == typeof eg || "function" == typeof eg) &&
          !~eA.indexOf(eg);
          eg = el(eg)
        )
          Object.getOwnPropertyNames(eg).forEach((eA) => {
            ep[eA] = () => ec[eA];
          });
        return ((ep.default = () => ec), __webpack_require__.d(ed, ep), ed);
      };
    })(),
    (() => {
      __webpack_require__.d = (eA, el) => {
        for (var ec in el)
          __webpack_require__.o(el, ec) &&
            !__webpack_require__.o(eA, ec) &&
            Object.defineProperty(eA, ec, { enumerable: !0, get: el[ec] });
      };
    })(),
    (() => {
      __webpack_require__.o = (eA, el) =>
        Object.prototype.hasOwnProperty.call(eA, el);
    })(),
    (() => {
      __webpack_require__.r = (eA) => {
        ("u" > typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(eA, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(eA, "__esModule", { value: !0 }));
      };
    })(),
    (() => {
      __webpack_require__.nmd = (eA) => (
        (eA.paths = []),
        eA.children || (eA.children = []),
        eA
      );
    })());
  return __webpack_require__;
}

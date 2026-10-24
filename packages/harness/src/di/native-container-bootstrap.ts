// @ts-nocheck
// Original container loader and synchronous registration entrypoints. Activation is explicit.
export const CONTAINER_BOOTSTRAP_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const CONTAINER_BOOTSTRAP_MODULES = [
  [3203, 15096082, 15096090],
  [3618, 15666691, 15666699],
  [80558, 15124846, 15124855],
  [50984, 30147, 32093],
  [67759, 124690, 124825],
  [21280, 215687, 215943],
  [39066, 287344, 287479],
  [62309, 330266, 330401],
  [53073, 126463, 126578],
  [94015, 267476, 267611],
  [65903, 15133966, 15134091],
  [10352, 15185147, 15185272],
  [53879, 15122180, 15122305],
  [92712, 15124856, 15124981],
  [61488, 15672222, 15672428],
  [97619, 15679962, 15680893],
  [54387, 15585090, 15585214],
  [66892, 15641173, 15641382],
  [30135, 241167, 241292],
  [18707, 15726898, 15727023],
  [57100, 15795888, 15796013],
  [57740, 15086190, 15086315],
  [63159, 15096091, 15096215],
  [98759, 15104549, 15104674],
  [5112, 15111258, 15111392],
  [94666, 24456, 24591],
  [59747, 15662104, 15662229],
  [75548, 15666700, 15666824],
  [8819, 6822229, 6822324],
] as const;
export function createNativeContainerBootstrap(runtime: any) {
  if (!runtime.di || typeof runtime.configBasePath !== "string")
    throw Error("Explicit native DI and product config base path required");
  const console = runtime.console ?? globalThis.console,
    __dirname = runtime.configBasePath;
  const factories = {
    3203() {},
    3618() {},
    80558() {},
    50984(eA, el, ec) {
      ec(52326);
      let { ContainerFactory: eu } = ec(80699);
      ec(25844).install();
      let ed = eu.create();
      function load(eA) {
        return Promise.resolve(eA.default).then((eA) => ed.load(eA));
      }
      (ed.load(ec(78842).default),
        ed.load(ec(67759).default),
        (eA.exports.container = Promise.resolve()
          .then(function () {
            return Promise.resolve(ec(21280)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(39066)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(62309)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(53073)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(94015)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(65903)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(10352)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(53879)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(92712)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(61488)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(97619)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(54387)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(66892)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(30135)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(18707)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(57100)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(57740)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(63159)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(98759)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(5112)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(94666)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(59747)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(75548)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(8819)).then(load);
          })
          .then(function () {
            return Promise.resolve(ec(8588)).then(load);
          })
          .then(() => ed)
          .catch((eA) => {
            (console.error("Failed to start the backend application."),
              eA && console.error(eA));
          })));
    },
    67759(eA, el, ec) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
      let eu = ec(80699);
      (ec(15062), (el.default = (0, eu.autoBind)()));
    },
    21280(eA, el, ec) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
      let eu = ec(80699),
        ed = ec(78824);
      el.default = (0, eu.autoBind)((eA) => {
        eA(ed.RestOperations)
          .toDynamicValue((eA) =>
            eA.container.get(ed.RestOperationsFactory).create(),
          )
          .inSingletonScope();
      });
    },
    39066(eA, el, ec) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
      let eu = ec(80699);
      (ec(27371), (el.default = (0, eu.autoBind)()));
    },
    62309(eA, el, ec) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
      let eu = ec(80699);
      (ec(47005), (el.default = (0, eu.autoBind)()));
    },
    53073(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.default = (0, ec(80699).autoBind)()));
    },
    94015(eA, el, ec) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
      let eu = ec(80699);
      (ec(37819), (el.default = (0, eu.autoBind)()));
    },
    65903(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(51147),
        (el.default = (0, ec(80699).autoBind)()));
    },
    10352(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(67846),
        (el.default = (0, ec(80699).autoBind)()));
    },
    53879(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(66915),
        (el.default = (0, ec(80699).autoBind)()));
    },
    92712(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(80558),
        (el.default = (0, ec(80699).autoBind)()));
    },
    61488(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }), ec(79814));
      let eu = ec(80699),
        ed = ec(61e3),
        ep = ec(72018);
      el.default = (0, eu.autoBind)((eA) => {
        eA(ep.FileSystem).toConstantValue(ed.fs);
      });
    },
    97619(eA, el, ec) {
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
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (eA, el) {
                Object.defineProperty(eA, "default", {
                  enumerable: !0,
                  value: el,
                });
              }
            : function (eA, el) {
                eA.default = el;
              }),
        ep =
          (this && this.__importStar) ||
          function (eA) {
            if (eA && eA.__esModule) return eA;
            var el = {};
            if (null != eA)
              for (var ec in eA)
                "default" !== ec &&
                  Object.prototype.hasOwnProperty.call(eA, ec) &&
                  eu(el, eA, ec);
            return (ed(el, eA), el);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }), ec(54463));
      let eg = ec(80699),
        eh = ep(ec(79896)),
        ef = ec(98776);
      el.default = (0, eg.autoBind)((eA, el, ec, eu) => {
        eu(ef.FileSystem).toConstantValue(eh);
      });
    },
    54387(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(9151),
        (el.default = (0, ec(80699).autoBind)()));
    },
    66892(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }), ec(55762));
      let eu = ec(80699),
        ed = ec(18629);
      el.default = (0, eu.autoBind)((eA) => {
        eA(ed.ProductConfigBasePath).toConstantValue(__dirname);
      });
    },
    30135(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(66467),
        (el.default = (0, ec(80699).autoBind)()));
    },
    18707(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(92735),
        (el.default = (0, ec(80699).autoBind)()));
    },
    57100(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(54834),
        (el.default = (0, ec(80699).autoBind)()));
    },
    57740(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(86482),
        (el.default = (0, ec(80699).autoBind)()));
    },
    63159(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(3203),
        (el.default = (0, ec(80699).autoBind)()));
    },
    98759(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(14931),
        (el.default = (0, ec(80699).autoBind)()));
    },
    5112(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(14931),
        ec(23294),
        (el.default = (0, ec(80699).autoBind)()));
    },
    94666(eA, el, ec) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
      let eu = ec(80699);
      (ec(83052), (el.default = (0, eu.autoBind)()));
    },
    59747(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(24015),
        (el.default = (0, ec(80699).autoBind)()));
    },
    75548(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        ec(3618),
        (el.default = (0, ec(80699).autoBind)()));
    },
    8819(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { default: () => eu }));
      let eu = (0, ec(80699).autoBind)();
    },
  };
  const cache = new Map();
  function ec(id: number) {
    if (id === 80699) return runtime.di;
    if (id === 52326 || id === 78842) return runtime.di.getModule(id);
    if (cache.has(id)) return cache.get(id).exports;
    if (!factories[id]) {
      const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
      if (value === undefined)
        throw Error("Explicit bootstrap parent required: " + id);
      cache.set(id, { exports: value });
      return value;
    }
    const module = { exports: {} };
    cache.set(id, module);
    factories[id](module, module.exports, ec);
    return module.exports;
  }
  ec.r = (o) => {
    Object.defineProperty(o, "__esModule", { value: true });
    Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
  };
  ec.d = (o, defs) => {
    for (const key of Object.keys(defs))
      Object.defineProperty(o, key, { enumerable: true, get: defs[key] });
  };
  return { start: () => ec(50984).container, getModule: ec };
}

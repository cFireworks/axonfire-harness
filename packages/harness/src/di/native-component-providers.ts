// @ts-nocheck
// Complete original inert provider modules and undecorated registry/creator classes.
// The parent supplies its container; no product DI bootstrap is executed.
export const COMPONENT_PROVIDER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const COMPONENT_PROVIDER_MODULES = [
  [63517, 76979, 77378],
  [6720, 77643, 78737],
  [99600, 116086, 116941],
] as const;
export const COMPONENT_PROVIDER_CLASSES = [
  [68809, "ef", 74718, 75385],
  [98025, "eh", 76817, 76882],
] as const;
export function createNativeComponentProviders(runtime: any = {}) {
  const console = runtime.console ?? globalThis.console;
  const factories = {
    63517(eA, el) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.ComponentFilterContribution =
          el.ComponentFilterRegistry =
          el.ComponentFilter =
          el.ProviderCreator =
            void 0),
        (el.ProviderCreator = Symbol("ProviderCreator")),
        (el.ComponentFilter = Symbol("ComponentFilter")),
        (el.ComponentFilterRegistry = Symbol("ComponentFilterRegistry")),
        (el.ComponentFilterContribution = Symbol(
          "ComponentFilterContribution",
        )));
    },
    6720(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.ContainerBasedProvider = void 0));
      let eu = ec(63517),
        ed = ec(17237),
        DEFAULT_GET_PRIORITY = (eA) => {
          if (eA)
            return "priority" in eA
              ? eA.priority
              : "order" in eA
                ? eA.order
                : 0;
        };
      let ContainerBasedProvider = class ContainerBasedProvider {
        constructor(eA, el) {
          ((this.componentId = eA), (this.container = el));
        }
        get(eA) {
          if (void 0 === this.components) {
            let el,
              ec = [],
              ed = this.container;
            for (; null !== ed; ) {
              if (ed.isBound(this.componentId))
                try {
                  ec.push(...ed.getAll(this.componentId));
                } catch (eA) {
                  console.error(eA);
                }
              (void 0 === el &&
                ed.isBound(eu.ComponentFilterRegistry) &&
                (el = ed.get(eu.ComponentFilterRegistry)),
                (ed = !0 === eA ? ed.parent : null));
            }
            this.components = el ? el.applyFilters(ec, this.componentId) : ec;
          }
          return this.components;
        }
        sortSync(eA = DEFAULT_GET_PRIORITY, el) {
          return (
            (this.components = ed.Prioritizeable.prioritizeAllSync(
              this.get(el),
              eA,
            ).map((eA) => eA.value)),
            this.components
          );
        }
        async sort(eA = DEFAULT_GET_PRIORITY, el) {
          let ec = await ed.Prioritizeable.prioritizeAll(this.get(el), eA);
          return (
            (this.components = ec.map((eA) => eA.value)),
            this.components
          );
        }
      };
      el.ContainerBasedProvider = ContainerBasedProvider;
    },
    99600(eA, el) {
      "use strict";
      var ec;
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.Prioritizeable = void 0),
        (function (eA) {
          async function toPrioritizeable(eA, el) {
            if (eA instanceof Array)
              return Promise.all(eA.map((eA) => toPrioritizeable(eA, el)));
            let ec = await eA;
            return { priority: await el(ec), value: ec };
          }
          function toPrioritizeableSync(eA, el = (eA) => eA.priority) {
            return eA.map((eA) => ({ value: eA, priority: el(eA) }));
          }
          function isValid(eA) {
            return eA.priority > 0;
          }
          function compare(eA, el) {
            return el.priority - eA.priority;
          }
          ((eA.toPrioritizeable = toPrioritizeable),
            (eA.toPrioritizeableSync = toPrioritizeableSync),
            (eA.prioritizeAllSync = function (eA, el) {
              return toPrioritizeableSync(eA, el).filter(isValid).sort(compare);
            }),
            (eA.prioritizeAll = async function (eA, el) {
              return (await toPrioritizeable(eA, el))
                .filter(isValid)
                .sort(compare);
            }),
            (eA.isValid = isValid),
            (eA.compare = compare));
        })(ec || (el.Prioritizeable = ec = {})));
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id);
    if (id === 17237)
      return { Prioritizeable: getModule(99600).Prioritizeable };
    if (!factories[id])
      throw Error("Explicit component provider dependency required: " + id);
    const exports = {};
    cache.set(id, exports);
    factories[id]({ exports }, exports, getModule);
    return exports;
  }
  const eg = getModule(6720);
  const ef = class {
    constructor(eA = []) {
      for (const el of ((this.initialized = !1),
      (this.genericFilters = []),
      (this.typeToFilters = new Map()),
      eA))
        el.registerContributionFilters(this);
      this.initialized = !0;
    }
    addFilters(eA, el) {
      if (this.initialized)
        throw Error("cannot add filters after initialization is done.");
      if ("*" === eA) this.genericFilters.push(...el);
      else for (let ec of eA) this.getOrCreate(ec).push(...el);
    }
    applyFilters(eA, el) {
      let ec = this.getFilters(el);
      return 0 === ec.length ? eA : eA.filter((eA) => ec.every((el) => el(eA)));
    }
    getOrCreate(eA) {
      let el = this.typeToFilters.get(eA);
      return (void 0 === el && this.typeToFilters.set(eA, (el = [])), el);
    }
    getFilters(eA) {
      return [...(this.typeToFilters.get(eA) || []), ...this.genericFilters];
    }
  };
  const eh = class {
    create(eA, el) {
      return new eg.ContainerBasedProvider(eA, el);
    }
  };
  return {
    getModule,
    ...getModule(63517),
    ...getModule(6720),
    ...getModule(99600),
    ComponentFilterRegistryImpl: ef,
    ProviderCreatorImpl: eh,
  };
}

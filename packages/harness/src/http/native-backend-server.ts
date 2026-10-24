// @ts-nocheck
// Original server activation factory; process/server ownership remains explicit.
export const BACKEND_SERVER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const BACKEND_SERVER_MODULES = [
  [86355, 125764, 126462],
  [39654, 125617, 125763],
] as const;
export function createNativeBackendServer(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit backend server process required");
  const process = runtime.process,
    console = runtime.console ?? globalThis.console;
  const factories = {
    86355(eA, el, ec) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
      let eu = ec(50984),
        ed = ec(71869),
        ep = ec(15536),
        eg = ec(31811),
        eh = ec(36746),
        ef = ec(98),
        em = ec(20847),
        eE = ec(47704),
        eC = ec(39654);
      eu.container.then(async (eA) => {
        (ep.ContainerProvider.set(eA), await eA.get(ed.Application).start());
        let el = eA.get(em.ConfigProvider),
          ec =
            parseInt(process.env.SERVER__PORT || "") ||
            el.get("cell.server", eC.DEFAULT_SERVER_OPTIONS).port,
          eu = eE();
        eu.all("*", async (el, ec) => {
          let eu = eA.get(eg.Dispatcher),
            ed = new eh.Context(el, ec);
          eh.Context.run(() => eu.dispatch(ed));
        });
        let ey = eu.listen(ec, process.env.SERVER__HOST || "127.0.0.1");
        for (let el of eA.getAll(ef.ServerAware)) await el.setServer(ey);
        console.log(`serve ${ec}`);
      });
    },
    39654(eA, el) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.DEFAULT_SERVER_OPTIONS = void 0),
        (el.DEFAULT_SERVER_OPTIONS = { port: 3e3 }));
    },
  };
  const cache = new Map();
  function ec(id: number) {
    if (cache.has(id)) return cache.get(id).exports;
    if (!factories[id]) {
      const exports = runtime.modules?.[id] ?? runtime.getModule?.(id);
      if (exports === undefined)
        throw Error("Explicit backend server parent required: " + id);
      cache.set(id, { exports });
      return exports;
    }
    const module = { exports: {} };
    cache.set(id, module);
    factories[id](module, module.exports, ec);
    return module.exports;
  }
  return { start: () => ec(86355), getModule: ec };
}

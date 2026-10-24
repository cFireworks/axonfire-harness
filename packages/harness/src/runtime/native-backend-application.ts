// @ts-nocheck
// Original backend application and state service. Construction installs no process handlers.
export const BACKEND_APPLICATION_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const BACKEND_APPLICATION_MODULES = [
  [93772, 120335, 121798],
  [96000, 119620, 120334],
] as const;
export function createNativeBackendApplication(runtime: any) {
  if (!runtime.process || !runtime.di?.Reflect)
    throw Error("Explicit backend process and native DI required");
  const process = runtime.process,
    Reflect = runtime.di.Reflect;
  const factories = {
    93772(eA, el, ec) {
      "use strict";
      var eu,
        ed =
          (this && this.__decorate) ||
          function (eA, el, ec, eu) {
            var ed,
              ep = arguments.length,
              eg =
                ep < 3
                  ? el
                  : null === eu
                    ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                    : eu;
            if (
              "object" == typeof Reflect &&
              "function" == typeof Reflect.decorate
            )
              eg = Reflect.decorate(eA, el, ec, eu);
            else
              for (var eh = eA.length - 1; eh >= 0; eh--)
                (ed = eA[eh]) &&
                  (eg =
                    (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                    eg);
            return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
          },
        ep =
          (this && this.__metadata) ||
          function (eA, el) {
            if (
              "object" == typeof Reflect &&
              "function" == typeof Reflect.metadata
            )
              return Reflect.metadata(eA, el);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.BackendApplication = void 0));
      let eg = ec(80699),
        eh = ec(96e3),
        ef = (eu = class extends eg.AbstractApplication {
          async start() {
            (this.setupExitSignals(),
              await this.doStart(),
              (this.stateService.state = "started"),
              (this.stateService.state = "ready"));
          }
          removeListeners(eA) {
            for (let el of process.listeners(eA))
              el._tag === eu.name && process.removeListener(eA, el);
          }
          setupExitSignals() {
            (this.removeListeners("SIGINT"), this.removeListeners("SIGTERM"));
            let eA = this.doExit.bind(this);
            ((eA._tag = eu.name),
              process.once("SIGINT", eA),
              process.once("SIGTERM", eA));
          }
          doExit() {
            (this.doStop(), process.exit(0));
          }
          async stop() {
            (this.doStop(), (this.stateService.state = "stoped"));
          }
        });
      ((el.BackendApplication = ef),
        ed(
          [
            (0, eg.Autowired)(eg.ApplicationStateService),
            ep("design:type", eh.BackendApplicationStateService),
          ],
          ef.prototype,
          "stateService",
          void 0,
        ),
        (el.BackendApplication = eu =
          ed([(0, eg.Component)(eg.Application)], ef)));
    },
    96e3(eA, el, ec) {
      "use strict";
      var eu =
        (this && this.__decorate) ||
        function (eA, el, ec, eu) {
          var ed,
            ep = arguments.length,
            eg =
              ep < 3
                ? el
                : null === eu
                  ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                  : eu;
          if (
            "object" == typeof Reflect &&
            "function" == typeof Reflect.decorate
          )
            eg = Reflect.decorate(eA, el, ec, eu);
          else
            for (var eh = eA.length - 1; eh >= 0; eh--)
              (ed = eA[eh]) &&
                (eg =
                  (ep < 3 ? ed(eg) : ep > 3 ? ed(el, ec, eg) : ed(el, ec)) ||
                  eg);
          return (ep > 3 && eg && Object.defineProperty(el, ec, eg), eg);
        };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.BackendApplicationStateService = void 0));
      let ed = ec(80699),
        ep = class extends ed.AbstractApplicationStateService {};
      ((el.BackendApplicationStateService = ep),
        (el.BackendApplicationStateService = eu(
          [(0, ed.Component)(ed.ApplicationStateService)],
          ep,
        )));
    },
  };
  const cache = new Map();
  function ec(id: number) {
    if (id === 80699) return runtime.di;
    if (cache.has(id)) return cache.get(id).exports;
    const module = { exports: {} };
    cache.set(id, module);
    factories[id](module, module.exports, ec);
    return module.exports;
  }
  return { ...ec(93772), ...ec(96000), getModule: ec };
}

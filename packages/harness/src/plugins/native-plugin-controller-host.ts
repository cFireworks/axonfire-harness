import * as readline from "node:readline/promises";
import { createNativePluginController } from "./native-plugin-controller.js";
import { createNativePluginValidator } from "./native-plugin-validator.js";
/** Explicit console/readline/Promise ownership around unchanged controller methods. */
export function createNativePluginControllerHost(options: {
  pluginManager: any;
  refresh: any;
  fsExtra: any;
  logger: any;
  consoleManager?: any;
  pluginValidator?: any;
  runtime?: Record<string, any>;
}) {
  let closed = false,
    closing: Promise<void> | undefined;
  const pending = new Set<Promise<any>>(),
    interfaces = new Set<any>();
  function own<T>(p: Promise<T>) {
    pending.add(p);
    void p.then(
      () => pending.delete(p),
      () => pending.delete(p),
    );
    return p;
  }
  const nativeReadline = options.runtime?.readline ?? readline;
  const ownedReadline = {
    createInterface(args: any) {
      if (closed) throw Error("Plugin controller is closed");
      const handle = nativeReadline.createInterface(args),
        abort = new AbortController();
      let disposed = false;
      const wrapper = {
        async question(prompt: string) {
          if (closed) throw Error("Plugin controller is closed");
          let rejectAbort!: (reason: any) => void;
          const aborted = new Promise<never>(
              (_resolve, reject) => (rejectAbort = reject),
            ),
            onAbort = () => rejectAbort(abort.signal.reason);
          abort.signal.addEventListener("abort", onAbort, { once: true });
          try {
            return await Promise.race([
              handle.question(prompt, { signal: abort.signal }),
              aborted,
            ]);
          } finally {
            abort.signal.removeEventListener("abort", onAbort);
          }
        },
        close() {
          if (disposed) return;
          disposed = true;
          interfaces.delete(wrapper);
          abort.abort(Error("Plugin controller is closed"));
          handle.close();
        },
      };
      interfaces.add(wrapper);
      return wrapper;
    },
  };
  const validatorClasses = createNativePluginValidator({
      fsExtra: options.fsExtra,
    }),
    pluginValidator =
      options.pluginValidator ?? new validatorClasses.PluginValidatorImpl();
  const controllerClasses = createNativePluginController({
    ...options.runtime,
    ManifestValidationError: validatorClasses.ManifestValidationError,
    readline: ownedReadline,
  });
  const controller = Object.assign(new controllerClasses.PluginController(), {
    logger: options.logger,
    pluginManager: options.pluginManager,
    pluginValidator,
    pluginRuntimeRefreshService: options.refresh,
    consoleManager: options.consoleManager ?? {
      log: (...args: any[]) => options.logger.info?.(...args),
    },
  });
  for (const name of Object.getOwnPropertyNames(
    controllerClasses.PluginController.prototype,
  )) {
    if (name === "constructor") continue;
    const native = controller[name].bind(controller);
    controller[name] = (...args: any[]) => {
      if (closed) throw Error("Plugin controller is closed");
      const value = native(...args);
      return value?.then ? own(value) : value;
    };
  }
  return {
    controller,
    controllerClasses,
    pluginValidator,
    validatorClasses,
    close() {
      return (closing ??= (async () => {
        closed = true;
        for (const i of [...interfaces]) i.close();
        while (pending.size) await Promise.allSettled([...pending]);
      })());
    },
    get pendingCount() {
      return pending.size;
    },
    get ownedHandleCount() {
      return interfaces.size;
    },
  };
}

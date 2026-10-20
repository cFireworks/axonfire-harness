import { AsyncLocalStorage } from "node:async_hooks";
import * as rxjs from "rxjs";
import * as operators from "rxjs/operators/index.js";
import { URI } from "vscode-uri";
import {
  createNativeAuthenticationRuntime,
  NATIVE_AUTHENTICATION_SCOPES,
} from "./native-authentication.js";

export interface NativeAuthenticationHostOptions {
  /** Explicit env/require/JWT/HTTP/telemetry graph. No installed account discovery. */
  runtime: any;
  dependencies: {
    logger: any;
    productManager: any;
    productEnvService: any;
    eventService: any;
    traceService: any;
    notifier: any;
    filePathService: any;
  };
  providers?: any[];
  storages?: any[];
  /** Stop this parent's borrowed browser/REST/IDE operations, including race losers.
   * The host never closes or arbitrarily cancels the shared services themselves.
   */
  beforeClose?(): unknown;
  sourceFactory?: typeof createNativeAuthenticationRuntime;
}

/** Parent assembly and resource ownership only. All authentication, revisions,
 * priority/config selection, retry and account decisions remain the original classes.
 */
export function createNativeAuthenticationHost(
  options: NativeAuthenticationHostOptions,
) {
  if (!options.runtime || !options.dependencies)
    throw Error(
      "Native authentication host requires explicit runtime and dependencies",
    );
  const admission = new AsyncLocalStorage<boolean>(),
    pending = new Set<Promise<any>>(),
    timers = new Set<any>(),
    intervals = new Set<any>(),
    subscriptions = new Set<any>(),
    owned = new Set<any>(),
    restorations: Array<() => void> = [],
    interceptors: Array<{ registry: any; id: any }> = [],
    errors: unknown[] = [];
  const observables = new WeakMap<object, any>(),
    services = new WeakMap<object, any>();
  let state: "open" | "closing" | "closed" = "open",
    closing: Promise<void> | undefined,
    starting: Promise<any> | undefined,
    latestInitialization: Promise<any> | undefined;
  const runtime = options.runtime,
    parentCommon = runtime.modules?.[80699] ?? {},
    core: any = {};
  // Overlay the original core without mutating or flattening the borrowed namespace.
  const common = new Proxy(
    {},
    {
      get(_target, key) {
        return Object.hasOwn(core, key)
          ? core[key]
          : Reflect.get(parentCommon, key, parentCommon);
      },
      ownKeys() {
        return [
          ...new Set([
            ...Reflect.ownKeys(parentCommon),
            ...Reflect.ownKeys(core),
          ]),
        ];
      },
      getOwnPropertyDescriptor(_target, key) {
        if (Object.hasOwn(core, key) || Object.hasOwn(parentCommon, key))
          return {
            configurable: true,
            enumerable: true,
            get: () => (common as any)[key],
          };
        return undefined;
      },
    },
  );
  const schedule = runtime.setTimeout ?? globalThis.setTimeout,
    cancel = runtime.clearTimeout ?? globalThis.clearTimeout,
    scheduleInterval = runtime.setInterval ?? globalThis.setInterval,
    cancelInterval = runtime.clearInterval ?? globalThis.clearInterval;
  function track<T>(value: T, detached = false): T {
    if (value && typeof (value as any).then === "function") {
      const completion = Promise.resolve(value);
      pending.add(completion);
      void completion.then(
        () => pending.delete(completion),
        (error) => {
          pending.delete(completion);
          if (detached) errors.push(error);
        },
      );
    }
    return value;
  }
  function accepted<T>(operation: () => T, detached = false): T {
    try {
      return admission.run(true, () => track(operation(), detached));
    } catch (error) {
      if (!detached) throw error;
      errors.push(error);
      return undefined as T;
    }
  }
  function assertAdmission() {
    if (state === "closed" || (state !== "open" && !admission.getStore()))
      throw Error("Native authentication host is closed");
  }
  function observable(value: any): any {
    if (observables.has(value)) return observables.get(value);
    const proxy = new Proxy(value, {
      get(target, key) {
        if (key === "subscribe")
          return (observer: any, ...args: any[]) => {
            const next =
              typeof observer === "function"
                ? function (this: any, ...values: any[]) {
                    return accepted(
                      () => Reflect.apply(observer, this, values),
                      true,
                    );
                  }
                : observer;
            const sub = target.subscribe(next, ...args);
            subscriptions.add(sub);
            return sub;
          };
        if (key === "pipe")
          return (...args: any[]) => observable(target.pipe(...args));
        const member = Reflect.get(target, key, target);
        return typeof member === "function" ? member.bind(target) : member;
      },
    });
    observables.set(value, proxy);
    return proxy;
  }
  function borrowed(value: any): any {
    if (!value || typeof value !== "object") return value;
    if (services.has(value)) return services.get(value);
    const proxy = new Proxy(value, {
      get(target, key) {
        const member = Reflect.get(target, key, target);
        if (
          (key === "configuration" || key === "urlSubject") &&
          member?.subscribe
        )
          return observable(member);
        if (typeof member === "function" && key !== "constructor")
          return (...args: any[]) =>
            accepted(() => Reflect.apply(member, target, args));
        return member;
      },
    });
    services.set(value, proxy);
    return proxy;
  }
  const modules: any = {
    42315: rxjs,
    51098: operators,
    22186: { URI },
    ...runtime.modules,
    80699: common,
  };
  const native = (options.sourceFactory ?? createNativeAuthenticationRuntime)({
    ...runtime,
    modules,
    setTimeout(callback: (...args: any[]) => any, ms: number, ...args: any[]) {
      const handle = schedule(() => {
        timers.delete(handle);
        return accepted(() => callback(...args), true);
      }, ms);
      timers.add(handle);
      return handle;
    },
    clearTimeout(handle: any) {
      timers.delete(handle);
      cancel(handle);
    },
    setInterval(callback: (...args: any[]) => any, ms: number, ...args: any[]) {
      const handle = scheduleInterval(() => {
        if (state === "open") accepted(() => callback(...args), true);
      }, ms);
      intervals.add(handle);
      return handle;
    },
    clearInterval(handle: any) {
      intervals.delete(handle);
      cancelInterval(handle);
    },
  });
  Object.assign(core, native.core);
  // Load only the requested original scope. A JWT/IDE dependency is not fabricated
  // just to eagerly materialize unrelated providers.
  const classes: any = {};
  for (const scope of NATIVE_AUTHENTICATION_SCOPES)
    for (const [name] of scope.exports)
      Object.defineProperty(classes, name, {
        enumerable: true,
        get: () => native.getModule(scope.id)[name],
      });
  const rawManager: any = new classes.AuthenticationManagerImpl();
  const assignedServices = new Set([
    "productManager",
    "productEnvService",
    "eventService",
    "traceService",
    "notifier",
    "filePathService",
    "restOperations",
    "externalUriOpener",
    "clientInfoProvider",
  ]);
  function ownSubject(subject: any) {
    const descriptor = Object.getOwnPropertyDescriptor(subject, "subscribe"),
      subscribe = subject.subscribe;
    Object.defineProperty(subject, "subscribe", {
      configurable: true,
      writable: true,
      value(...args: any[]) {
        const sub = Reflect.apply(subscribe, subject, args);
        subscriptions.add(sub);
        return sub;
      },
    });
    restorations.push(() => {
      if (descriptor) Object.defineProperty(subject, "subscribe", descriptor);
      else delete subject.subscribe;
    });
  }
  function instrument(target: any, initialization = false): any {
    owned.add(target);
    for (const value of Object.values(target))
      if (value instanceof rxjs.Subject) ownSubject(value);
    const methods = new Set<string>();
    for (
      let prototype = Object.getPrototypeOf(target);
      prototype && prototype !== Object.prototype;
      prototype = Object.getPrototypeOf(prototype)
    )
      for (const name of Object.getOwnPropertyNames(prototype))
        if (
          name !== "constructor" &&
          typeof Object.getOwnPropertyDescriptor(prototype, name)?.value ===
            "function"
        )
          methods.add(name);
    // Observe original internal calls as well (init's detached doInit, refresh
    // tails, persistence, provider polling). Original receivers/bodies stay intact.
    for (const name of methods) {
      const original = target[name];
      Object.defineProperty(target, name, {
        configurable: true,
        writable: true,
        value: function (this: any, ...args: any[]) {
          if (state === "closed") {
            const error = Error("Native authentication host is closed");
            if (original.constructor?.name === "AsyncFunction")
              return Promise.reject(error);
            throw error;
          }
          const value =
            name === "waitAuthSession"
              ? Reflect.apply(original, this, args)
              : accepted(() => Reflect.apply(original, this, args));
          if (initialization && name === "doInit")
            latestInitialization = Promise.resolve(value);
          return value;
        },
      });
    }
    return new Proxy(target, {
      get(value, key) {
        const member = Reflect.get(value, key, value);
        if (typeof member !== "function" || key === "constructor")
          return member;
        return (...args: any[]) => {
          try {
            assertAdmission();
          } catch (error) {
            if (
              methods.has(String(key)) &&
              member.constructor?.name !== "AsyncFunction"
            ) {
              const proto = Object.getPrototypeOf(value),
                original = proto[key];
              if (original?.constructor?.name === "AsyncFunction")
                return Promise.reject(error);
            }
            throw error;
          }
          return Reflect.apply(member, value, args);
        };
      },
      set(value, key, member) {
        return Reflect.set(
          value,
          key,
          assignedServices.has(String(key)) ? borrowed(member) : member,
          value,
        );
      },
    });
  }
  const manager = instrument(rawManager, true),
    storage = instrument(new classes.DefaultAuthenticationStorage()),
    providers = options.providers ?? [];
  Object.assign(manager, options.dependencies, {
    authenticationStorages: options.storages ?? [storage],
    authenticationProvider: { get: () => providers },
  });
  function createCustomToken() {
    assertAdmission();
    const storage = instrument(
        new classes.CustomTokenAuthenticationStorageImpl(),
      ),
      provider = instrument(new classes.CustomTokenAuthenticationProvider());
    Object.assign(storage, {
      productManager: options.dependencies.productManager,
      logger: options.dependencies.logger,
    });
    Object.assign(provider, {
      productManager: options.dependencies.productManager,
      logger: options.dependencies.logger,
      customTokenAuthenticationStorage: storage,
    });
    return { storage, provider };
  }
  function createExternalLink(dependencies: {
    clientInfoProvider: any;
    externalUriOpener: any;
    restOperations: any;
  }) {
    assertAdmission();
    const provider = instrument(
      new classes.ExternalLinkAuthenticationProvider(),
    );
    Object.assign(provider, {
      logger: options.dependencies.logger,
      productManager: options.dependencies.productManager,
      productEnvService: options.dependencies.productEnvService,
      ...dependencies,
    });
    provider.init();
    return provider;
  }
  function createWx(dependencies: { restOperations: any }) {
    assertAdmission();
    const provider = instrument(new classes.WxAuthenticationProvider());
    Object.assign(provider, {
      logger: options.dependencies.logger,
      productManager: options.dependencies.productManager,
      ...dependencies,
    });
    provider.init();
    return provider;
  }
  function createUserInfoResolver() {
    assertAdmission();
    const resolver = instrument(new classes.UserInfoContextVariableResolver());
    resolver.authenticationManager = manager;
    return resolver;
  }
  function installHttpInterceptor(restOperations: any) {
    assertAdmission();
    for (const name of ["request", "response"])
      if (
        typeof restOperations.interceptors?.[name]?.use !== "function" ||
        typeof restOperations.interceptors[name].eject !== "function"
      )
        throw Error(
          "Owned authentication HTTP installation requires use/eject registries",
        );
    const registries: any = {};
    for (const name of ["request", "response"]) {
      const registry = restOperations.interceptors[name];
      registries[name] = {
        use(...callbacks: any[]) {
          const id = registry.use(
            ...callbacks.map((callback) =>
              typeof callback === "function"
                ? function (this: any, ...args: any[]) {
                    assertAdmission();
                    return accepted(() => Reflect.apply(callback, this, args));
                  }
                : callback,
            ),
          );
          interceptors.push({ registry, id });
          return id;
        },
      };
    }
    const interceptor = instrument(new classes.AuthenticationHttpInterceptor());
    Object.assign(interceptor, {
      authenticationManager: manager,
      productManager: options.dependencies.productManager,
      logger: options.dependencies.logger,
      notifier: options.dependencies.notifier,
      restOperations: { interceptors: registries },
    });
    interceptor.initialize();
    return interceptor;
  }
  function start(): Promise<any> {
    try {
      assertAdmission();
    } catch (error) {
      return Promise.reject(error);
    }
    if (starting) return starting;
    try {
      accepted(() => rawManager.init());
    } catch (error) {
      return Promise.reject(error);
    }
    if (!latestInitialization)
      return Promise.reject(
        Error("Original authentication init did not start doInit"),
      );
    starting = latestInitialization;
    return starting;
  }
  async function drain() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  function close(): Promise<void> {
    if (closing) return closing;
    state = "closing";
    closing = (async () => {
      const failures: unknown[] = [];
      const attempt = (operation: () => void) => {
        try {
          operation();
        } catch (error) {
          failures.push(error);
        }
      };
      try {
        // The original dispose invalidates revisions, aborts the current sign
        // context and cancels its refresh promise, without logout/credential deletion.
        attempt(() => accepted(() => rawManager.dispose()));
        for (const { registry, id } of interceptors)
          try {
            registry.eject(id);
          } catch (error) {
            failures.push(error);
          }
        interceptors.length = 0;
        for (const interval of intervals)
          attempt(() => cancelInterval(interval));
        intervals.clear();
        if (options.beforeClose)
          try {
            await accepted(options.beforeClose);
          } catch (error) {
            failures.push(error);
          }
        // Keep polling/sleep timeouts alive while accepted operations need them.
        await drain();
        await rawManager.sessionPersistenceTail;
      } catch (error) {
        failures.push(error);
      } finally {
        for (const sub of subscriptions)
          try {
            sub.unsubscribe();
          } catch (error) {
            failures.push(error);
          }
        subscriptions.clear();
        for (const timer of timers)
          try {
            cancel(timer);
          } catch (error) {
            failures.push(error);
          }
        timers.clear();
        for (const target of owned)
          for (const value of Object.values(target))
            if (value instanceof rxjs.Subject) attempt(() => value.complete());
        for (const restore of restorations) attempt(restore);
        restorations.length = 0;
        owned.clear();
        admission.disable();
        state = "closed";
      }
      if (failures.length || errors.length)
        throw new AggregateError(
          [...failures, ...errors],
          "Native authentication host close failed",
        );
    })();
    return closing;
  }
  return {
    native,
    classes,
    common,
    modules,
    manager,
    storage,
    providers,
    start,
    drain,
    close,
    createCustomToken,
    createExternalLink,
    createWx,
    createUserInfoResolver,
    installHttpInterceptor,
    get state() {
      return state;
    },
    get pendingCount() {
      return pending.size;
    },
    get timerCount() {
      return timers.size;
    },
    get subscriptionCount() {
      return subscriptions.size;
    },
    get interceptorCount() {
      return interceptors.length;
    },
    get errors(): readonly unknown[] {
      return [...errors];
    },
  };
}

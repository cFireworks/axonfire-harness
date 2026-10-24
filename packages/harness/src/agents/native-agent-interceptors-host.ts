import { createNativeComponentProviders } from "../di/native-component-providers.js";
import { createNativeWorktreeContext } from "./native-worktree-context.js";
import { NATIVE_AGENT_RUN_REGISTRATIONS } from "./native-agent-run-registration.js";
import type { createNativeAgentRunHost } from "./native-agent-run-host.js";

export interface NativeAgentInterceptorsHostOptions {
  execution: ReturnType<typeof createNativeAgentRunHost>;
  /** The same token namespaces and parent DI used by the original AgentService. */
  getModule(id: number): any;
  container: { isBound(token: any): boolean; get(token: any): any };
  /** Optional original component filters. No inferred disabled/no-op services. */
  filterRegistry?: any;
  providerFactory?: typeof createNativeComponentProviders;
  worktreeFactory?: typeof createNativeWorktreeContext;
}

/** Complete fixed-sample interceptor registration, with explicit parent DI.
 * This is a composition adapter, not a replacement Inversify implementation.
 * It does not supply missing product services or silently omit registered classes.
 */
export function createNativeAgentInterceptorsHost(
  options: NativeAgentInterceptorsHostOptions,
) {
  const dependencies = new Map<string, Record<string, any>>();
  const releases: (() => void)[] = [];
  const callbackWork = new Set<Promise<any>>();
  let starting: Promise<void> | undefined, closing: Promise<void> | undefined;
  const failures: Error[] = [];
  for (const registration of NATIVE_AGENT_RUN_REGISTRATIONS) {
    const values: Record<string, any> = {};
    for (const property of registration.properties) {
      const label = `${registration.name}.${property.property} (${property.tokenModule}.${property.tokenExport})`;
      try {
        const token = options.getModule(property.tokenModule)?.[
          property.tokenExport
        ];
        if (token === undefined) throw Error("token namespace is missing");
        if (!options.container.isBound(token)) {
          if (property.optional) continue;
          throw Error("required service is not bound");
        }
        values[property.property] = options.container.get(token);
      } catch (cause) {
        failures.push(new Error(label, { cause }));
      }
    }
    dependencies.set(registration.name, values);
  }
  if (failures.length)
    throw new AggregateError(
      failures,
      "Native interceptor parent graph is incomplete",
    );
  const sandbox = dependencies.get("SandboxAgentRunInterceptor")!;
  if (sandbox.sandboxLifecycle) {
    const target = sandbox.sandboxLifecycle,
      methods = new Map<PropertyKey, any>();
    sandbox.sandboxLifecycle = new Proxy(target, {
      get(value, key) {
        const method = Reflect.get(value, key, value);
        if (typeof method !== "function") return method;
        if (!methods.has(key))
          methods.set(
            key,
            key === "onSessionReady"
              ? (callback: (...args: any[]) => any) => {
                  const release = Reflect.apply(method, value, [
                    function (this: any, ...args: any[]) {
                      if (closing)
                        return Promise.reject(
                          Error("Native interceptor host is closing"),
                        );
                      const result = Reflect.apply(callback, this, args);
                      const settled = Promise.resolve(result).then(
                        () => {},
                        () => {},
                      );
                      callbackWork.add(settled);
                      void settled.then(() => callbackWork.delete(settled));
                      return result;
                    },
                  ]);
                  if (typeof release !== "function")
                    throw Error(
                      "Original sandbox onSessionReady unsubscribe required",
                    );
                  releases.push(release as () => void);
                  return release;
                }
              : method.bind(value),
          );
        return methods.get(key);
      },
    });
  }
  const Worktree = options.worktreeFactory
    ? options.worktreeFactory({ getModule: options.getModule })
    : options.execution.modules[59233].WorktreeContextInterceptor;
  const instances = new Map<string, any>();
  for (const registration of NATIVE_AGENT_RUN_REGISTRATIONS) {
    const values = dependencies.get(registration.name)!;
    const instance =
      registration.sourceModule === 59233
        ? Object.assign(new Worktree(), values)
        : options.execution.createInterceptor(registration.name, values);
    instances.set(registration.name, instance);
  }
  const native = (options.providerFactory ?? createNativeComponentProviders)();
  const componentId = options.getModule(69466).AgentRunInterceptor;
  if (componentId === undefined)
    throw Error("Original AgentRunInterceptor token required");
  // The host owns only these registrations; the supplied original filter registry
  // is borrowed. This local container view has no implicit parent/global lookup.
  const provider = new native.ContainerBasedProvider(componentId, {
    parent: null,
    isBound: (token: any) =>
      token === componentId ||
      (token === native.ComponentFilterRegistry &&
        options.filterRegistry !== undefined),
    getAll: () => [...instances.values()],
    get: () => options.filterRegistry,
  });
  let initialized = false,
    previousProvider: any,
    attached = false;
  return {
    native,
    instances,
    provider,
    start(): Promise<void> {
      if (closing)
        return Promise.reject(Error("Native interceptor host is closing"));
      return (starting ??= (async () => {
        for (const registration of NATIVE_AGENT_RUN_REGISTRATIONS)
          for (const lifecycle of registration.lifecycle)
            await instances.get(registration.name)[lifecycle.method]();
        initialized = true;
      })());
    },
    /** Attach only after explicit initialization. Original Provider decides order/cache. */
    attach() {
      if (closing || !initialized)
        throw Error("Initialize native interceptors before attaching");
      if (attached) return;
      previousProvider = options.execution.service.agentRunInterceptorProvider;
      options.execution.service.agentRunInterceptorProvider = provider;
      attached = true;
    },
    close(): Promise<void> {
      return (closing ??= Promise.resolve().then(async () => {
        // Do not leave unobserved lifecycle work behind after a close request.
        const errors: unknown[] = [];
        try {
          await starting;
        } catch (error) {
          errors.push(error);
        }
        try {
          for (const release of releases.splice(0).reverse())
            try {
              release();
            } catch (error) {
              errors.push(error);
            }
          while (callbackWork.size) await Promise.all([...callbackWork]);
        } finally {
          if (
            attached &&
            options.execution.service.agentRunInterceptorProvider === provider
          )
            options.execution.service.agentRunInterceptorProvider =
              previousProvider;
          attached = false;
        }
        if (errors.length)
          throw new AggregateError(errors, "Native interceptor cleanup failed");
      }));
    },
  };
}

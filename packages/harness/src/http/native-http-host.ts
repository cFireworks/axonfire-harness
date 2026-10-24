// Explicit namespace/hook ownership around the unchanged original HTTP core.
import { createNativePluginSemver } from "../plugins/native-plugin-semver.js";
import * as util from "node:util";
import assert from "node:assert";
import * as asyncHooks from "node:async_hooks";
import { randomUUID } from "node:crypto";
import {
  createNativeHttpRuntime,
  NATIVE_HTTP_CONFIGURATION,
  NATIVE_HTTP_SCOPES,
} from "./native-http-runtime.js";

export interface NativeHttpHostOptions {
  modules?: Record<number, any>;
  getModule?: (id: number) => any;
  env?: Record<string, string | undefined>;
  Reflect?: any;
  console?: any;
  sourceFactory?: typeof createNativeHttpRuntime;
  /** Defer context creation until requested by the original module graph. */
  lazy?: boolean;
}
export function createNativeHttpHost(options: NativeHttpHostOptions = {}) {
  const hooks = new Set<asyncHooks.AsyncHook>(),
    pending = new Set<Promise<any>>();
  const processState: any = {
    env: options.env ?? {},
    namespaces: {},
    versions: { ...process.versions },
    _rawDebug: (process as any)._rawDebug.bind(process),
  };
  const common: any = {};
  const modules: any = {
    94377: createNativePluginSemver(),
    39023: util,
    42613: assert,
    90290: {
      ...asyncHooks,
      createHook(callbacks: asyncHooks.HookCallbacks) {
        const hook = asyncHooks.createHook(callbacks);
        hooks.add(hook);
        return hook;
      },
    },
    80699: common,
    ...options.modules,
  };
  function releaseOwnedState() {
    for (const hook of hooks) hook.disable();
    hooks.clear();
    for (const ns of Object.values(processState.namespaces) as any[])
      if (ns) {
        ns._contexts.clear();
        ns._set.length = 0;
        ns.active = null;
      }
    processState.namespaces = {};
  }
  try {
    const native = (options.sourceFactory ?? createNativeHttpRuntime)({
      modules,
      process: processState,
      Reflect: options.Reflect,
      console: options.console,
      getModule: options.getModule,
    });
    Object.assign(common, native.common, { generateUUUID: randomUUID });
    let Context: any, namespace: any, classes: any;
    let configuration: { component: string; property: string; key: any }[];
    let closed = false, closing: Promise<void> | undefined;
    function initialize() {
      if (closed) throw Error("Native HTTP host is closed");
      if (classes) return;
      try {
        Context = native.Context;
        namespace = native.cls.getNamespace(
          "3f45efdf-383c-4152-877b-1e98a410e0da",
        );
        configuration = NATIVE_HTTP_CONFIGURATION.map(
          ([id, local, property, expression, keyModule, keyExport]) => ({
            component:
              NATIVE_HTTP_SCOPES.find((scope) => scope.id === id)?.exports.find(
                (entry) => entry[1] === local,
              )?.[0] ?? local,
            property,
            key: keyModule
              ? native.getModule(keyModule)[keyExport!]
              : JSON.parse(expression),
          }),
        );
        classes = native.classes;
      } catch (error) {
        closed = true;
        releaseOwnedState();
        throw error;
      }
    }
    if (!options.lazy) initialize();
    function run<T>(
      request: any,
      response: any,
      operation: (context: any) => T,
    ): T {
      if (closed) throw Error("Native HTTP host is closed");
      initialize();
      // Use the original namespace's return-preserving API, not an ALS approximation.
      // Context.run itself still retains its original undefined return/fire-and-forget behavior.
      const value = namespace.runAndReturn(() => {
        const context = new Context(request, response);
        Context.setCurrent(context);
        return operation(context);
      });
      if (value && typeof (value as any).then === "function") {
        const completion = Promise.resolve(value);
        pending.add(completion);
        void completion.then(
          () => pending.delete(completion),
          () => pending.delete(completion),
        );
      }
      return value;
    }
    function close(): Promise<void> {
      if (closing) return closing;
      closed = true;
      closing = (async () => {
        while (pending.size) await Promise.allSettled([...pending]);
        // Original destroyNamespace only tombstones the registry; it does not disable its hook.
        // Additional owned-host cleanup, never a change to the original CLS factory.
        releaseOwnedState();
      })();
      return closing;
    }
    return {
      native,
      get configuration() { initialize(); return configuration; },
      get Context() { initialize(); return Context; },
      get BaseContext() { initialize(); return native.BaseContext; },
      get AttributeScope() { initialize(); return native.AttributeScope; },
      get namespace() { initialize(); return namespace; },
      processState,
      common,
      modules,
      get classes() { initialize(); return classes; },
      run,
      close,
      get closed() {
        return closed;
      },
      get hookCount() {
        return hooks.size;
      },
      get pendingCount() {
        return pending.size;
      },
    };
  } catch (error) {
    releaseOwnedState();
    throw error;
  }
}

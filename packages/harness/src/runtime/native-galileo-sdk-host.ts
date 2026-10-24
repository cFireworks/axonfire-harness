import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import { createNativeExportContext } from "./native-export-context.js";
import { createNativeOtelEnvironment } from "./native-otel-environment.js";
import { createNativeOtelResource } from "./native-otel-resource.js";
import { createNativeOtlpExport } from "./native-otlp-export.js";
import { createNativeOtlpHttp } from "./native-otlp-http.js";
import { createNativeOtlpSerializers } from "./native-otlp-serializers.js";
import { createNativeGalileoTransport } from "./native-galileo-transport.js";
import { createNativeGalileoExporters } from "./native-galileo-exporters.js";
import { createNativeLoggerProvider } from "./native-logger-provider.js";
import { createNativeBasicTracer } from "./native-basic-tracer.js";
import { createNativeGalileoTrace } from "./native-galileo-trace.js";
import { createNativeGalileoMetricExporter } from "./native-galileo-metric-exporter.js";
import { createNativeMetricReader } from "./native-metric-reader.js";
import { createNativeMeterProvider } from "./native-meter-provider.js";
import { createNativeGalileoMeters } from "./native-galileo-meters.js";
import { createNativeGalileoSelfMonitor } from "./native-galileo-self-monitor.js";
import { createNativeGalileoSetup } from "./native-galileo-setup.js";
import { createNativeGalileoLogger } from "./native-galileo-logger.js";
import { createNativeGalileoConfig } from "./native-galileo-config.js";
import { createNativeGalileoFetch } from "./native-galileo-fetch.js";
import { createNativeGalileoHttpInstrumentation } from "./native-galileo-http-instrumentation.js";

export interface NativeGalileoSdkHostOptions {
  registry: Record<PropertyKey, any>;
  globals: Record<PropertyKey, any>;
  process: any;
  profilerSupport: {
    NODE_VERSION_SUPPORTED: boolean;
    MIN_NODE_VERSION: string;
  };
  console?: any;
  sdkOverrides?: Record<string, any>;
  getModule?: (id: number) => any;
}

/** Owned assembly of captured components; does not initialize telemetry on creation. */
export function createNativeGalileoSdkHost(
  options: NativeGalileoSdkHostOptions,
) {
  if (!options.registry || !options.globals || !options.process)
    throw Error("Explicit Galileo registry, globals and process required");
  const require = createRequire(import.meta.url);
  const context: any = createNativeExportContext({
    registry: options.registry,
    modules: {
      90290: require("node:async_hooks"),
      24434: require("node:events"),
    },
  });
  const environment: any = createNativeOtelEnvironment({
    process: options.process,
  });
  const resources: any = createNativeOtelResource({
    process: options.process,
    diag: context.diag,
  });
  const ownedProviders = new Set<any>(),
    configs = new Set<any>(),
    instruments = new Set<any>(),
    hooks = new Set<any>(),
    managers = new Set<any>(),
    pending = new Set<Promise<any>>();
  let closing = false,
    closePromise: Promise<void> | undefined;
  let sdk: any,
    exporters: any,
    loggerProviders: any,
    tracer: any,
    trace: any,
    metrics: any,
    readers: any,
    providers: any,
    meters: any,
    setup: any,
    fetch: any,
    httpInstrumentation: any,
    config: any;
  const deferred = (id: number) =>
    new Proxy({}, { get: (_target, key) => getModule(id)[key] });
  function getModule(id: number): any {
    if ([70000, 6023, 55733].includes(id)) return environment.getModule(id);
    if ([70647, 58583, 57717, 98902, 33835, 65890].includes(id))
      return context.getModule(id);
    if (id === 2339) return { diag: context.diag };
    if ([78766, 92321].includes(id)) return resources.getModule(id);
    if (id === 32047) return { otperformance: performance };
    if (id === 54601) return require("node:crypto");
    if (id === 58611) return require("node:http");
    if (id === 65692) return require("node:https");
    if (id === 43106) return require("node:zlib");
    if (id === 24434) return require("node:events");
    if ([20662, 3250, 44874].includes(id)) return httpOptions.getModule(id);
    if ([41437, 11447, 77047].includes(id)) return serializers.getModule(id);
    if (id === 15086) return sdk;
    if (id === 15183) return exporters.getModule(id);
    if ([69700, 14515, 62207, 84992, 72544, 11440].includes(id))
      return trace.getModule(id);
    if ([84746, 23258, 67006, 51244, 45185].includes(id))
      return tracer.getModule(id);
    if (id === 36182) return providers.getModule(id);
    if (id === 37366) return meters.getModule(id);
    if (id === 64270) return setup.getModule(id);
    if (id === 86097) return { Config: OwnedConfig };
    if (id === 8009) return { FetchInstrumentation: OwnedFetch };
    if (id === 9808) return { HttpInstrumentation: OwnedHttp };
    if (
      [
        32704, 99997, 32192, 30460, 71664, 95497, 4439, 67177, 6461, 14138,
        88752, 60002, 61549, 36275,
      ].includes(id)
    )
      return loggerProviders.getModule(id);
    const supplied = options.getModule?.(id);
    if (supplied !== undefined) return supplied;
    if (fetch) return fetch.getModule(id);
    throw Error("Unresolved Galileo SDK parent: " + id);
  }
  const otlp: any = createNativeOtlpExport({
    getModule: (id: number) =>
      [69700, 14515, 62207, 84992, 11440, 84746, 15086].includes(id)
        ? deferred(id)
        : getModule(id),
  });
  const httpOptions: any = createNativeOtlpHttp({
    process: options.process,
    diag: context.diag,
    getModule,
  });
  const serializers: any = createNativeOtlpSerializers({ getModule });
  sdk = {
    ...createNativeGalileoExporters({ constantsOnly: true }).sdk,
    ...options.sdkOverrides,
  };
  const transport: any = createNativeGalileoTransport({
    crypto: require("node:crypto"),
    http: require("node:http"),
    https: require("node:https"),
    zlib: require("node:zlib"),
    sdk: deferred(15086),
  });
  const exporterRuntime = {
    exports: otlp,
    http: httpOptions,
    serializers,
    transport,
  };
  exporters = createNativeGalileoExporters(exporterRuntime);
  sdk = { ...exporters.sdk, ...options.sdkOverrides };
  loggerProviders = createNativeLoggerProvider({
    serializers,
    context,
    environment,
    resources,
    diag: context.diag,
    getModule,
  });
  tracer = createNativeBasicTracer({ getModule });
  const ownedPropagators = new Set<any>();
  const registerPropagator = tracer.propagation.setGlobalPropagator.bind(
    tracer.propagation,
  );
  tracer.propagation.setGlobalPropagator = (p: any) => {
    const ok = registerPropagator(p);
    if (ok) ownedPropagators.add(p);
    return ok;
  };
  const Manager = context.AsyncLocalStorageContextManager;
  trace = createNativeGalileoTrace({
    getModule,
    sdk,
    exporters,
    tracerProviders: tracer,
    context: {
      ...context,
      AsyncLocalStorageContextManager: class extends Manager {
        constructor() {
          super();
          managers.add(this);
        }
      },
    },
  });
  metrics = createNativeGalileoMetricExporter({
    ...exporterRuntime,
    sdk,
    diag: context.diag,
    getModule,
  });
  readers = createNativeMetricReader({
    metrics,
    diag: context.diag,
    internal: context.internal,
    exportResult: loggerProviders.getModule(36275),
    getModule,
  });
  providers = createNativeMeterProvider({
    readers,
    metrics,
    serializers,
    resources,
    diag: context.diag,
    getModule,
  });
  const common = {
    readers,
    metrics,
    providers,
    resources,
    enums: exporters.getModule(15183),
    sdk,
    getModule,
  };
  meters = createNativeGalileoMeters(common);
  const self: any = createNativeGalileoSelfMonitor(common);
  const own = (provider: any) => {
    ownedProviders.add(provider);
    return provider;
  };
  const getSelfMeterProvider = (...args: any[]) =>
    own(self.getSelfMeterProvider(...args));
  setup = createNativeGalileoSetup({
    ...common,
    registry: options.registry,
    process: options.process,
    console: options.console ?? options.globals.console,
    profilerSupport: options.profilerSupport,
    trace: tracer.trace,
    metrics: meters.metrics,
    transport,
    getSelfMeterProvider,
    registerTracerProvider: (o: any) => own(trace.registerTracerProvider(o)),
    registerMeterProvider: (o: any) => own(meters.registerMeterProvider(o)),
  });
  config = createNativeGalileoConfig({
    require,
    process: options.process,
    console: options.console ?? options.globals.console,
  });
  // The factory has explicit parents; never recurse into its own fallback for unknown ids.
  fetch = createNativeGalileoFetch({
    globals: options.globals,
    require,
    process: options.process,
    getModule: (id: number) => {
      if (
        [
          11447, 51244, 33835, 23258, 67006, 67177, 41437, 15183, 45185, 37366,
          64270, 2339, 98902, 65890,
        ].includes(id)
      )
        return getModule(id);
      const value = options.getModule?.(id);
      if (value !== undefined) return value;
      throw Error("Unresolved Fetch parent: " + id);
    },
  });
  httpInstrumentation = createNativeGalileoHttpInstrumentation({
    globals: options.globals,
    process: options.process,
    getModule,
  });
  const hookModule = fetch.getModule(2385),
    OriginalHook = hookModule.Hook;
  hookModule.Hook = function (...args: any[]) {
    const hook = new OriginalHook(...args);
    hooks.add(hook);
    return hook;
  };
  class OwnedConfig extends config.Config {
    constructor(o: any) {
      super(o);
      configs.add(this);
    }
    async fetchConfig() {
      const job = super.fetchConfig();
      pending.add(job);
      try {
        return await job;
      } finally {
        pending.delete(job);
      }
    }
  }
  class OwnedFetch extends fetch.FetchInstrumentation {
    constructor(o: any) {
      super(o);
      instruments.add(this);
    }
  }
  class OwnedHttp extends httpInstrumentation.HttpInstrumentation {
    constructor(o: any) {
      super(o);
      instruments.add(this);
    }
  }
  const Provider = loggerProviders.LoggerProvider;
  const outer: any = createNativeGalileoLogger({
    ...common,
    context,
    providers: {
      ...loggerProviders,
      LoggerProvider: class extends Provider {
        constructor(o: any) {
          super(o);
          own(this);
        }
      },
    },
    exporters,
    resolveGalileoEncryptionConfig: transport.resolveGalileoEncryptionConfig,
    getSelfMeterProvider,
    process: options.process,
    console: options.console ?? options.globals.console,
    valueTypes: serializers.getModule(11447),
  });
  function assertOpen() {
    if (closing) throw Error("Galileo SDK host is closing");
  }
  class Logger extends outer.Logger {
    constructor(o: any) {
      assertOpen();
      super(o);
    }
  }
  async function SetupGalileo(o: any) {
    assertOpen();
    const job = setup.SetupGalileo(o);
    pending.add(job);
    try {
      return await job;
    } finally {
      pending.delete(job);
    }
  }
  async function forceFlush() {
    await Promise.all([...ownedProviders].map((p) => p.forceFlush()));
  }
  function close(): Promise<void> {
    if (closePromise) return closePromise;
    closing = true;
    closePromise = (async () => {
      const failures: unknown[] = [];
      const release = (fn: () => void) => {
        try {
          fn();
        } catch (error) {
          failures.push(error);
        }
      };
      await Promise.allSettled([...pending]);
      for (const c of configs) release(() => c.stopPull());
      await Promise.allSettled([...pending]);
      for (const i of [...instruments].reverse()) {
        release(() => i.disable());
        for (const h of i._hooks ?? []) release(() => h.unhook?.());
      }
      for (const h of hooks) release(() => h.unhook());
      hookModule.Hook = OriginalHook;
      const settled = await Promise.allSettled(
        [...ownedProviders].map((p) =>
          Promise.resolve().then(() => p.shutdown()),
        ),
      );
      for (const result of settled)
        if (result.status === "rejected") failures.push(result.reason);
      release(() => {
        if (ownedProviders.has(meters.metrics.getMeterProvider()))
          meters.metrics.disable();
      });
      release(() => {
        const current = tracer.trace.getTracerProvider();
        if (ownedProviders.has(current.getDelegate?.() ?? current))
          tracer.trace.disable();
      });
      release(() => {
        if (ownedPropagators.has(tracer.propagation._getGlobalPropagator()))
          tracer.propagation.disable();
      });
      release(() => {
        if (managers.has(context.context._getContextManager()))
          context.context.disable();
      });
      release(() => {
        if (ownedProviders.has(setup.logs.getLoggerProvider()))
          setup.logs.disable();
      });
      for (const manager of managers) release(() => manager.disable());
      if (failures.length)
        throw new AggregateError(failures, "Galileo SDK shutdown failed");
    })();
    return closePromise;
  }
  return {
    SetupGalileo,
    Logger,
    forceFlush,
    close,
    getModule,
    context,
    trace: tracer.trace,
    metrics: meters.metrics,
    logs: setup.logs,
    sdk,
  };
}

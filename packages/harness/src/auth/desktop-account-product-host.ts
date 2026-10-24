import * as fs from "node:fs";
import { randomUUID } from "node:crypto";
import * as os from "node:os";
import * as path from "node:path";
import { Agent as HttpAgent } from "node:http";
import { Agent as HttpsAgent } from "node:https";
import { Subject } from "rxjs";
import { createNativeDesktopExternalLink } from "./native-desktop-external-link.js";
import { createNativeHostExternalUriOpener } from "./native-host-external-uri-opener.js";
import { createNativeWorkbuddyClientInfo } from "./native-workbuddy-client-info.js";
import { createNativeHostedCliLifecycle } from "../terminal/native-hosted-cli-lifecycle.js";
import { createNativeAuthenticationRuntime } from "./native-authentication.js";
import { createNativeWorkbuddyAuthBindings } from "./native-workbuddy-auth-bindings.js";
import { createNativeDesktopFileAuthentication } from "./native-desktop-file-authentication.js";
import { createNativeDesktopCustomToken } from "./native-desktop-custom-token.js";
import { createNativeAuthProductCoordinator } from "../config/native-auth-product-coordinator.js";
import { createNativeDesktopProductManager } from "../config/native-desktop-product-manager.js";
import { createNativeDesktopProductMerger } from "../config/native-desktop-product-merger.js";
import { createNativeDesktopClientProduct } from "../config/native-desktop-client-product.js";
import { createNativeDesktopEnvironmentProviders } from "../config/native-desktop-environment-providers.js";
import { createNativeWorkbuddyLocalStorage } from "../config/native-workbuddy-local-storage.js";
import { createNativeDesktopCloudProduct } from "../config/native-desktop-cloud-product.js";
import { createNativeProductExperimentManager } from "../config/native-product-experiment-manager.js";
import { createNativeDesktopRest } from "../http/native-desktop-rest.js";
import { createNativeDesktopProductInterceptors } from "../http/native-desktop-product-interceptors.js";

export interface DesktopAccountProductHostOptions {
  /** Explicit roots; resourcesRoot contains cli/product.json. */
  resourcesRoot: string;
  productDirectory: string;
  configDirectory: string;
  env: NodeJS.ProcessEnv;
  dependencies: {
    logger: any;
    traceService: any;
    eventService: any;
    notifier: any;
    filePathService: any;
    gitInfoCollector?: any;
  };
  /** Additional original providers may be wired by the parent before start. */
  authenticationProviders?: (services: any) => any[];
  /** Explicit browser boundary. Supplied opener/client-info services are borrowed. */
  browserLogin?: { clientInfoProvider?: any } & (
    | { externalUriOpener: any; openExternal?: never }
    | { externalUriOpener?: never; openExternal: (url: string) => unknown }
  );
  /** Explicit parent configuration layers, evaluated by the original product manager. */
  productProviders?: (services: any) => any[];
  http?: { timeout?: number; proxy?: false };
}

/** Host assembly only, not recovered source. Owns the constructed instances and
 * sockets; diagnostics and caller-provided providers remain borrowed services.
 * Call close even after start rejects. No installed account discovery is used.
 */
export function createDesktopAccountProductHost(
  options: DesktopAccountProductHostOptions,
) {
  for (const root of [
    options.resourcesRoot,
    options.productDirectory,
    options.configDirectory,
  ])
    if (!path.isAbsolute(root))
      throw Error("Desktop account/product roots must be absolute");
  const { logger } = options.dependencies;
  const env: NodeJS.ProcessEnv = {
    ...options.env,
    WORKBUDDY_CONFIG_DIR: options.configDirectory,
  };
  // Original snapshot publication owns and may unlink its prior spill path.
  // Never hand it the caller's input file; preserve original bytes in a private copy.
  const bootstrapInput = options.env.ACC_PRODUCT_CONFIG_PATH;
  const bootstrapCopy = bootstrapInput
    ? path.join(
        options.configDirectory,
        `.account-bootstrap-${randomUUID()}.json`,
      )
    : undefined;
  if (bootstrapCopy) env.ACC_PRODUCT_CONFIG_PATH = bootstrapCopy;
  const scopedProcess = Object.create(process);
  Object.defineProperty(scopedProcess, "resourcesPath", {
    value: options.resourcesRoot,
  });
  scopedProcess.env = env;
  const runtime = {
    process: scopedProcess,
    assetsRoot: options.resourcesRoot,
    os: { ...os, homedir: () => options.configDirectory },
    logger,
    console: { ...logger, log: (...v: any[]) => logger.info(...v) },
  };
  const core = createNativeAuthenticationRuntime(runtime).core;
  const coordinatorApi: any = createNativeAuthProductCoordinator(runtime);
  const productApi: any = createNativeDesktopProductManager({
    ...runtime,
    coordinatorApi,
  });
  const product = new productApi.WorkbuddyProductManager();
  let coordinator: any, authentication: any;
  const app: any = createNativeWorkbuddyAuthBindings({
    ...runtime,
    core,
    productConfig: productApi.productConfig,
    getCoordinator: () => coordinator,
    getAuthenticationManager: () => authentication,
  });
  authentication = new app.WorkbuddyAuthenticationManager();
  const merge: any = createNativeDesktopProductMerger();
  product.productMerger = Object.assign(new merge.DefaultProductMerger(), {
    productMergeStrategies: [
      new merge.OverrideProductMergeStrategy(),
      new merge.MergeProductMergeStrategy(),
      new merge.SmartMergeProductMergeStrategy(),
      new merge.DeepSmartMergeProductMergeStrategy(),
      new merge.CommandsSmartMergeProductMergeStrategy(),
    ],
  });
  const storageApi: any = createNativeWorkbuddyLocalStorage({
    ...runtime,
    productConfig: coordinatorApi.productConfig,
  });
  const localStorage = new storageApi.WorkbuddyFileLocalStorage();
  product.localStorage = localStorage;
  const fileApi: any = createNativeDesktopFileAuthentication(runtime);
  fileApi.setWorkbuddyAuthenticationConfigurationProvider(
    productApi.getWorkbuddyAuthenticationConfiguration,
  );
  const fileStorage = Object.assign(new fileApi.FileAuthenticationStorage(), {
    logger,
    productManager: product,
    filePathService: { sharedDataPath: options.configDirectory },
  });
  const custom: any = createNativeDesktopCustomToken(runtime);
  const customStorage = Object.assign(
    new custom.CustomTokenAuthenticationStorageImpl(),
    { logger, productManager: product },
  );
  const customProvider = Object.assign(
    new custom.CustomTokenAuthenticationProvider(),
    {
      productManager: product,
      customTokenAuthenticationStorage: customStorage,
    },
  );
  const environment = Object.assign(new app.WorkbuddyProductEnvService(), {
    logger,
    productManager: product,
  });
  Object.assign(authentication, options.dependencies, {
    productManager: product,
    productEnvService: environment,
    authenticationStorages: [
      Object.assign(new app.WorkbuddyBootstrapAuthenticationStorage(), {
        fileAuthenticationStorage: fileStorage,
      }),
      fileStorage,
      customStorage,
    ],
  });
  const httpAgent = new HttpAgent({ keepAlive: false });
  const httpsAgent = new HttpsAgent({ keepAlive: false });
  const restApi: any = createNativeDesktopRest(runtime);
  const restFactory = new restApi.DefaultRestOperationsFactory();
  restFactory.clientConfig = {
    timeout: 5000,
    ...options.http,
    httpAgent,
    httpsAgent,
  };
  const restOperations = restFactory.create();
  const policies: any = createNativeDesktopProductInterceptors({
    ...runtime,
    env,
    productManager: product,
  });
  const endpointPolicy = Object.assign(
    new policies.ProductEndpointHttpInterceptor(),
    { restOperations },
  );
  const authPolicy = Object.assign(
    new policies.AuthenticationHttpInterceptor(),
    {
      restOperations,
      authenticationManager: authentication,
      productManager: product,
      logger,
      notifier: options.dependencies.notifier,
    },
  );
  const clientApi: any = createNativeDesktopClientProduct({
    ...runtime,
    dirname: options.productDirectory,
  });
  const client = Object.assign(new clientApi.ClientProductProvider(), {
    fs,
    configBasePath: options.productDirectory,
    logger,
  });
  const envApi: any = createNativeDesktopEnvironmentProviders({
    ...runtime,
    dirname: options.productDirectory,
    interceptors: policies,
  });
  envApi.setDevEnvEndpointResolver({
    resolve: () => coordinatorApi.devEnvironment.resolveEndpointOverride(),
  });
  const internet = Object.assign(
    new envApi.WorkbuddyInternetEnviromentProductProvider(),
    { fs, configBasePath: options.productDirectory, logger },
  );
  const providers = [
    client,
    internet,
    new envApi.WorkbuddyDevEnvEndpointProductProvider(),
  ];
  product.productProviderProvider = {
    sort: async () =>
      (
        await core.Prioritizeable.prioritizeAll(
          providers,
          (p: any) => p.priority,
        )
      ).map((p: any) => p.value),
  };
  const userinfo = Object.assign(new app.WorkbuddyUserinfoProvider(), {
    authenticationManager: authentication,
  });
  const cloudApi: any = createNativeDesktopCloudProduct({
    ...runtime,
    productManager: product,
  });
  const cloud = Object.assign(new cloudApi.CloudProductManagerImpl(), {
    logger,
    localStorage,
    userinfoProvider: userinfo,
    restOperations,
  });
  const experimentApi: any = createNativeProductExperimentManager(runtime);
  const experiment = Object.assign(
    new experimentApi.WorkbuddyProductExperimentManager(),
    {
      logger,
      restOperations,
      productManager: product,
      authenticationManager: authentication,
      gitInfoCollector: options.dependencies.gitInfoCollector,
    },
  );
  coordinator = Object.assign(
    new coordinatorApi.WorkbuddyAuthProductCoordinator(),
    {
      logger,
      productManager: product,
      authenticationManager: authentication,
      productMerger: product.productMerger,
      cloudProductManager: cloud,
      experimentManager: experiment,
    },
  );
  app.setWorkbuddyAuthSessionSyncer((session: any) =>
    coordinator.syncResolvedProduct(session),
  );
  const browserUrls = new Subject<string>();
  const clientInfoApi =
    options.browserLogin && !options.browserLogin.clientInfoProvider
      ? createNativeWorkbuddyClientInfo(runtime)
      : undefined;
  clientInfoApi?.setWorkbuddyClientInfoAssetResolver((...segments: string[]) =>
    segments[0] === "cli"
      ? path.join(options.resourcesRoot, ...segments)
      : path.join(options.productDirectory, ...segments),
  );
  const clientInfo = clientInfoApi
    ? Object.assign(new clientInfoApi.WorkbuddyClientInfoProvider(), {
        productManager: product,
        filePathService:
          typeof options.dependencies.filePathService.setIDEType === "function"
            ? options.dependencies.filePathService
            : undefined,
      })
    : undefined;
  const hostOpenerApi =
    options.browserLogin && !options.browserLogin.externalUriOpener
      ? createNativeHostExternalUriOpener(runtime)
      : undefined;
  hostOpenerApi?.setWorkbuddyExternalUriOpenDelegate(
    options.browserLogin?.openExternal,
  );
  const browserOpener =
    options.browserLogin?.externalUriOpener ??
    (hostOpenerApi
      ? new hostOpenerApi.WorkbuddyHostExternalUriOpener()
      : undefined);
  const externalLinkApi: any = options.browserLogin
    ? createNativeDesktopExternalLink({
        ...runtime,
        core,
        authenticationApi: app.authenticationApi,
      })
    : undefined;
  const externalLink = externalLinkApi
    ? Object.assign(new externalLinkApi.ExternalLinkAuthenticationProvider(), {
        logger,
        productManager: product,
        productEnvService: environment,
        restOperations,
        clientInfoProvider:
          options.browserLogin!.clientInfoProvider ?? clientInfo,
        externalUriOpener: {
          urlSubject: browserUrls,
          open: (url: string) => browserOpener.open(url),
        },
      })
    : undefined;
  let browserSubscription: { unsubscribe(): void } | undefined;
  const services = {
    authentication,
    product,
    coordinator,
    cloud,
    experiment,
    localStorage,
    fileStorage,
    customStorage,
    userinfo,
    restOperations,
    environment,
    authenticationApi: app.authenticationApi,
    externalLink,
    externalLinkApi,
    clientInfo,
  };
  providers.push(...(options.productProviders?.(services) ?? []));
  const additionalProviders = options.authenticationProviders?.(services) ?? [];
  authentication.authenticationProvider = {
    get: () => [
      customProvider,
      ...(externalLink ? [externalLink] : []),
      ...additionalProviders,
    ],
  };

  let state: "open" | "closing" | "closed" = "open";
  let starting: Promise<void> | undefined, closing: Promise<void> | undefined;
  const pending = new Set<Promise<unknown>>();
  const lifecycleStops = new Set<() => Promise<void>>();
  function track<T>(value: T): T {
    if (value && typeof (value as any).then === "function") {
      const promise = Promise.resolve(value);
      pending.add(promise);
      void promise.then(
        () => pending.delete(promise),
        () => pending.delete(promise),
      );
    }
    return value;
  }
  // Wrap methods on owned instances, including calls the originals start without
  // awaiting. Preserve method arguments, receivers and exact returned promises.
  for (const service of [
    authentication,
    product,
    coordinator,
    cloud,
    experiment,
    fileStorage,
    customStorage,
    localStorage,
    environment,
    ...(externalLink ? [externalLink] : []),
    ...(clientInfo ? [clientInfo] : []),
  ]) {
    const names = new Set<string>();
    for (
      let proto = Object.getPrototypeOf(service);
      proto && proto !== Object.prototype;
      proto = Object.getPrototypeOf(proto)
    ) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (name === "constructor" || names.has(name)) continue;
        names.add(name);
        const descriptor = Object.getOwnPropertyDescriptor(proto, name);
        if (typeof descriptor?.value !== "function") continue;
        const original = descriptor.value;
        Object.defineProperty(service, name, {
          configurable: true,
          writable: true,
          value: function (this: any, ...args: any[]) {
            // This original method returns void but accepts an already-running
            // listener promise. Its warning/retry-key behavior stays original.
            if (service === coordinator && name === "runInBackground")
              track(args[0]);
            return track(Reflect.apply(original, this, args));
          },
        });
      }
    }
  }
  async function drain() {
    do {
      await Promise.allSettled([...pending]);
      await new Promise<void>((resolve) => setImmediate(resolve));
    } while (pending.size);
  }
  function assertOpen() {
    if (state !== "open") throw Error("Desktop account/product host is closed");
  }
  function start(): Promise<void> {
    assertOpen();
    return (starting ??= (async () => {
      fs.mkdirSync(options.configDirectory, { recursive: true });
      if (bootstrapInput && bootstrapCopy && fs.existsSync(bootstrapInput))
        fs.copyFileSync(bootstrapInput, bootstrapCopy);
      localStorage.init();
      client.init?.();
      internet.init();
      experiment.init();
      endpointPolicy.initialize();
      authPolicy.initialize();
      product.loadFromCache();
      await product.sync();
      environment.init();
      clientInfo?.initialize();
      if (externalLink) {
        browserSubscription = browserOpener.urlSubject.subscribe(
          (url: string) => browserUrls.next(url),
        );
        externalLink.init();
      }
      fileStorage.init();
      await authentication.doInit();
      coordinator.init();
      await coordinator.syncResolvedProduct(
        authentication.currentSessionSubject.getValue(),
      );
      await drain();
    })());
  }
  function close(): Promise<void> {
    if (closing) return closing;
    state = "closing";
    return (closing = (async () => {
      try {
        await starting?.catch(() => undefined);
        const stoppingLifecycles = [...lifecycleStops].map((stop) => stop());
        authentication.dispose();
        browserSubscription?.unsubscribe();
        browserUrls.complete();
        await fileStorage.dispose();
        fileStorage.storeSessionSubject.complete();
        if (product.proxySyncThrottleTimer) {
          clearTimeout(product.proxySyncThrottleTimer);
          product.proxySyncThrottleTimer = undefined;
        }
        customStorage.storeSessionSubject.complete();
        await experiment.clear("host-close");
        await Promise.all(stoppingLifecycles);
        await drain();
        product.configuration.complete();
        // A previously accepted refresh can schedule polling while draining.
        await experiment.clear("host-drained");
        await drain();
      } finally {
        browserSubscription?.unsubscribe();
        browserUrls.complete();
        externalLinkApi?.setLoginStepCallback(undefined);
        clientInfo?.clientInfo$.complete();
        if (hostOpenerApi) {
          hostOpenerApi.setWorkbuddyExternalUriOpenDelegate(undefined);
          browserOpener.urlSubject.complete();
        }
        if (product.proxySyncThrottleTimer)
          clearTimeout(product.proxySyncThrottleTimer);
        product.onDidChangeEmitter.dispose();
        localStorage.emitter.dispose();
        httpAgent.destroy();
        httpsAgent.destroy();
        if (bootstrapCopy) fs.rmSync(bootstrapCopy, { force: true });
        state = "closed";
      }
    })());
  }
  function bindHostedCliRuntime(dependencies: {
    runtimeManager: any;
    prewarmPool?: any;
    sessionManager?: any;
    agentBackend?: any;
  }) {
    assertOpen();
    const lifecycle: any = createNativeHostedCliLifecycle(runtime);
    const snapshot = lifecycle.bindProductSnapshot({
      celljs: { coordinator },
      logger,
      runtimeManager: dependencies.runtimeManager,
      prewarmPool: dependencies.prewarmPool,
    });
    const auth = lifecycle.bindHostedCliAuthLifecycle({
      ...dependencies,
      logger,
      authenticationManager: authentication,
    });
    let stopping: Promise<void> | undefined;
    function stop() {
      if (stopping) return stopping;
      snapshot.dispose();
      return (stopping = (async () => {
        await auth.stop();
        await drain();
        lifecycleStops.delete(stop);
      })());
    }
    lifecycleStops.add(stop);
    return { stop };
  }
  return {
    env,
    /** Borrowed views for integration/inspection. Mutations must use host methods;
     * callers must not retain or use these instances after close begins. */
    services,
    start,
    close,
    bindHostedCliRuntime,
    get state() {
      return state;
    },
    async login(context: any = {}) {
      assertOpen();
      await start();
      assertOpen();
      return authentication.login(context);
    },
    async logout() {
      assertOpen();
      await start();
      assertOpen();
      return authentication.logout();
    },
    async refresh() {
      assertOpen();
      await start();
      assertOpen();
      return coordinator.syncResolvedProduct(
        authentication.currentSessionSubject.getValue(),
      );
    },
  };
}

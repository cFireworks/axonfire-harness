import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as http from "node:http";
import * as https from "node:https";
import * as net from "node:net";
import * as tls from "node:tls";
import {
  execFile as nodeExecFile,
  type ChildProcess,
} from "node:child_process";
import { promisify } from "node:util";
import { AsyncLocalStorage } from "node:async_hooks";
import { loadProductConfiguration } from "../config/product-config.js";
import { createOwnedPluginFilesystem } from "../plugins/owned-plugin-filesystem.js";
import { createCapturedNodeProxyAgents } from "../vendor/captured-node-proxy-agents.js";
import { createNativeResourcePrompt } from "./native-resource-prompt.js";
import { desktopTemplateDirectory } from "./desktop-template-assets.js";
import { createNativePromptCliLanguage } from "./native-prompt-cli-language.js";

export type ResourcePromptHostOptions = {
  stateDir: string;
  getWorkDir(): string;
  templatesDir?: string;
  env?: NodeJS.ProcessEnv;
  locale?: string;
  productManager?: {
    waitConfiguration(): Promise<any>;
    getEndpoint(): string | undefined;
  };
  auth?: { getAccount(): any; getToken(): any };
  authentication?: {
    buildAuthHeaders?(jwt: boolean, product: boolean, device: boolean): any;
  };
  binaryManager?: {
    generatePromptContext(disabledTypes?: string[]): Promise<any>;
  };
  getRegisteredBinaryTypes?: () => string[];
  logger?: any;
  /** No remote requests unless the caller explicitly owns/authorizes each target and proxy origin. */
  allowedOrigins?: string[];
  runtime?: Record<string, any>;
};

/** Independent lifecycle / IO composition, not Electron, account discovery, or BinaryManager implementation. */
export async function createResourcePromptHost(
  options: ResourcePromptHostOptions,
) {
  await fs.promises.mkdir(path.resolve(options.stateDir), { recursive: true });
  const root = await fs.promises.realpath(path.resolve(options.stateDir));
  const home = path.join(root, "home"),
    configDir = path.join(home, ".workbuddy");
  const templatesDir = path.resolve(
    options.templatesDir ?? desktopTemplateDirectory(),
  );
  const env = { ...options.env };
  const pending = new Set<Promise<any>>(),
    timers = new Set<any>();
  const requests = new Set<http.ClientRequest>(),
    responses = new Set<http.IncomingMessage>();
  const children = new Set<ChildProcess>(),
    proxyAgents = new Set<any>();
  const sockets = new Set<any>(),
    closeWaiters = new Set<Promise<void>>();
  function trackClose<
    T extends { once(event: string, callback: (...args: any[]) => any): any },
  >(resource: T, set: Set<T>) {
    set.add(resource);
    const closed = new Promise<void>((resolve) =>
      resource.once("close", () => {
        set.delete(resource);
        closeWaiters.delete(closed);
        resolve();
      }),
    );
    closeWaiters.add(closed);
    return resource;
  }
  const operations = new AsyncLocalStorage<{ active: number }>();
  let closed = false,
    closing: Promise<void> | undefined;
  const logger = Object.fromEntries(
    ["info", "warn", "error", "debug"].map((name) => [
      name,
      (...args: any[]) => options.logger?.[name]?.(...args),
    ]),
  );
  function run<T>(callback: () => T): T {
    let operation = operations.getStore();
    if (closed && !operation?.active)
      throw Error("Resource prompt host is closed");
    operation = operation?.active ? operation : { active: 0 };
    operation.active++;
    const finish = () => {
      operation!.active--;
    };
    let result: T;
    try {
      result = operations.run(operation, callback);
    } catch (error) {
      finish();
      throw error;
    }
    if (result && typeof (result as any).then === "function") {
      const job = result as unknown as Promise<any>;
      pending.add(job);
      void job.then(
        () => {
          pending.delete(job);
          finish();
        },
        () => {
          pending.delete(job);
          finish();
        },
      );
    } else finish();
    return result;
  }
  const ownAsync =
    (native: (...args: any[]) => any) =>
    (...args: any[]) => {
      try {
        return run(() => native(...args));
      } catch (error) {
        return Promise.reject(error);
      }
    };
  const inside = (base: string, file: string) => {
    const rel = path.relative(base, file);
    return (
      rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel)
    );
  };
  function readable(target: string) {
    const file = path.resolve(target),
      roots = [root, path.resolve(options.getWorkDir()), templatesDir];
    if (file === "/proc/version") return file;
    const allowed = roots.find((base) => inside(base, file));
    if (!allowed)
      throw Error(
        "Resource prompt read is outside owned state/project/templates",
      );
    if (
      fs.existsSync(file) &&
      fs.existsSync(allowed) &&
      !inside(fs.realpathSync(allowed), fs.realpathSync(file))
    )
      throw Error("Resource prompt read traverses external symlink");
    return file;
  }
  const writes = createOwnedPluginFilesystem(root);
  const promises: any = {
    readFile: ownAsync((target, ...args) =>
      (fs.promises.readFile as any)(readable(target), ...args),
    ),
    access: ownAsync((target, ...args) =>
      (fs.promises.access as any)(readable(target), ...args),
    ),
    stat: ownAsync((target, ...args) =>
      (fs.promises.stat as any)(readable(target), ...args),
    ),
    opendir: ownAsync((target, ...args) =>
      (fs.promises.opendir as any)(readable(target), ...args),
    ),
    open: ownAsync((target, flags) => {
      if (flags !== "r") throw Error("Prompt archive open is read-only");
      return fs.promises.open(readable(target), flags);
    }),
    mkdir: ownAsync((target, configuration) =>
      path.resolve(target) === root
        ? fs.promises.mkdir(root, configuration)
        : writes.mkdir(target, configuration),
    ),
    writeFile: ownAsync((target, ...args) => writes.writeFile(target, ...args)),
    copyFile: ownAsync((from, to) => writes.copyFile(readable(from), to)),
    rename: ownAsync((from, to) => writes.rename(from, to)),
    unlink: ownAsync((target) => writes.unlink(target)),
    rm: ownAsync((target, configuration) => {
      if (path.basename(target) !== "memery")
        throw Error("Prompt archive purge requires owned memery directory");
      return writes.rm(target, configuration);
    }),
  };
  const ownedFs = {
    constants: fs.constants,
    promises,
    existsSync(target: string) {
      try {
        return fs.existsSync(readable(target));
      } catch {
        return false;
      }
    },
    readFileSync(target: string, ...args: any[]) {
      return (fs.readFileSync as any)(readable(target), ...args);
    },
  };
  const allowed = new Set(
    (options.allowedOrigins ?? []).map((value) => {
      const url = new URL(value);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw Error(
          "Prompt network origin must be explicit HTTP(S), without URL credentials",
        );
      return url.origin;
    }),
  );
  function checkOrigin(value: string | URL, proxy = false) {
    const url = new URL(value);
    if (!allowed.has(url.origin) || (!proxy && (url.username || url.password)))
      throw Error("Resource prompt network origin is not explicitly allowed");
    return url;
  }
  const agents = {
    http: new http.Agent({ ...(http.globalAgent as any).options }),
    https: new https.Agent({ ...(https.globalAgent as any).options }),
  };
  function protocol(native: typeof http | typeof https, agent: any) {
    return {
      request(target: URL, configuration: any, listener: any) {
        if (closed) throw Error("Resource prompt HTTP is closed");
        const url = checkOrigin(target);
        const request = native.request(
          url,
          { ...configuration, agent: configuration.agent ?? agent },
          listener,
        );
        trackClose(request, requests);
        request.once("response", (response) => {
          trackClose(response, responses);
          response.once("error", (error) => request.emit("error", error));
        });
        return request;
      },
    };
  }
  const proxyClasses = createCapturedNodeProxyAgents({
    require(id: string) {
      if (id !== "net" && id !== "tls") return undefined;
      const module = id === "net" ? net : tls;
      return {
        ...module,
        connect(...args: any[]) {
          const socket = trackClose((module.connect as any)(...args), sockets);
          socket.on("error", () => {});
          return socket;
        },
      };
    },
  });
  function ownedAgent(Agent: any) {
    return new Proxy(Agent, {
      construct(target, args) {
        checkOrigin(args[0], true);
        const instance = Reflect.construct(target, args) as object;
        proxyAgents.add(instance);
        return instance;
      },
    });
  }
  const execFile: any = (
    command: string,
    args: string[],
    configuration: any,
    callback: any,
  ) => {
    if (closed) throw Error("Resource prompt git probe is closed");
    if (
      command !== "git" ||
      JSON.stringify(args) !== '["rev-parse","--is-inside-work-tree"]'
    )
      throw Error("Only the original read-only Git prompt probe is allowed");
    const cwd = readable(configuration.cwd);
    const child = nodeExecFile(
      command,
      args,
      {
        ...configuration,
        cwd,
        env: { PATH: process.env.PATH, HOME: home, ...env },
      },
      callback,
    );
    trackClose(child, children);
    return child;
  };
  execFile[promisify.custom] = ownAsync(
    (command, args, configuration) =>
      new Promise((resolve, reject) =>
        execFile(
          command,
          args,
          configuration,
          (error: any, stdout: string, stderr: string) =>
            error ? reject(error) : resolve({ stdout, stderr }),
        ),
      ),
  );
  const schedule = options.runtime?.setTimeout ?? setTimeout,
    cancel = options.runtime?.clearTimeout ?? clearTimeout;
  const product =
    options.productManager ??
    (await loadProductConfiguration().then((value) => ({
      waitConfiguration: async () => value.raw,
      getEndpoint: () => value.raw.endpoint,
    })));
  const native = createNativeResourcePrompt({
    ...options.runtime,
    getWorkDir: options.getWorkDir,
    env,
    fs: ownedFs,
    os: { ...os, homedir: () => home, ...options.runtime?.os },
    childProcess: { execFile },
    http: protocol(http, agents.http),
    https: protocol(https, agents.https),
    proxyAgents: {
      HttpProxyAgent: ownedAgent(proxyClasses.HttpProxyAgent),
      HttpsProxyAgent: ownedAgent(proxyClasses.HttpsProxyAgent),
    },
    console: Object.fromEntries(
      ["info", "warn", "error", "debug"].map((name) => [name, logger[name]]),
    ),
    contextOptions: {
      configDir,
      userDataDir: path.join(configDir, "app"),
      promptTemplatesDir: templatesDir,
      ...(options.locale ? { locale: options.locale } : {}),
    },
    ...(options.getRegisteredBinaryTypes
      ? { getRegisteredBinaryTypes: options.getRegisteredBinaryTypes }
      : {}),
    ownAsync,
    setTimeout(callback: () => void, ms: number) {
      const handle = schedule(() => {
        timers.delete(handle);
        callback();
      }, ms);
      timers.add(handle);
      return handle;
    },
    clearTimeout(handle: any) {
      timers.delete(handle);
      cancel(handle);
    },
    queueMicrotask(callback: () => any) {
      void run(
        () =>
          new Promise<void>((resolve, reject) =>
            queueMicrotask(() => {
              try {
                Promise.resolve(callback()).then(() => resolve(), reject);
              } catch (error) {
                reject(error);
              }
            }),
          ),
      ).catch((error) =>
        logger.warn!("Prompt archive migration failed", error),
      );
    },
  });
  const instrumented = new WeakSet<object>();
  function instrument(instance: any): any {
    if (!instance || instrumented.has(instance)) return instance;
    instrumented.add(instance);
    for (const name of Object.getOwnPropertyNames(
      Object.getPrototypeOf(instance),
    )) {
      if (name === "constructor") continue;
      const original = instance[name];
      if (typeof original !== "function") continue;
      const method = original.bind(instance);
      instance[name] = (...args: any[]) => {
        try {
          return run(() => {
            const value = method(...args);
            if (name === "getRenderer") instrument(value);
            if (name === "getCollectors")
              for (const collector of value) instrument(collector);
            return value;
          });
        } catch (error) {
          if (method.constructor.name === "AsyncFunction")
            return Promise.reject(error);
          throw error;
        }
      };
    }
    return instance;
  }
  const service = instrument(
    Object.assign(new native.WorkbuddySystemPromptService(), {
      logger,
      productManager: product,
      authService: options.auth ?? {
        getAccount: () => undefined,
        getToken: () => undefined,
      },
      authenticationManager: options.authentication ?? {},
      binaryManager: options.binaryManager,
    }),
  );
  async function flush() {
    while (pending.size) await Promise.allSettled([...pending]);
  }
  return {
    native,
    service,
    root,
    home,
    configDir,
    templatesDir,
    env,
    resolveCliLanguage: () =>
      createNativePromptCliLanguage(native).resolveCliSettingsLanguage({
        readAppConfigValue: native.readAppConfigValue,
        getSystemLocale: native.context.getWorkbuddyRuntimeLocale,
      }),
    flush,
    close() {
      if (closing) return closing;
      closed = true;
      for (const request of requests)
        request.destroy(Error("Resource prompt host closed"));
      for (const response of responses) response.destroy();
      for (const child of children) child.kill("SIGTERM");
      for (const socket of sockets)
        socket.destroy(Error("Resource prompt host closed"));
      closing = (async () => {
        await flush();
        // The original cleanup is a no-op today, but keep its exact call in the ownership scope.
        operations.run({ active: 1 }, () => service.cleanup());
        for (const timer of timers) cancel(timer);
        timers.clear();
        for (const agent of [...proxyAgents, agents.http, agents.https])
          agent.destroy();
        proxyAgents.clear();
        await Promise.allSettled([...closeWaiters]);
        native.resolutionCache.clear();
        native.remoteFallbackCooldowns.clear();
        operations.disable();
      })();
      return closing;
    },
    get closed() {
      return closed;
    },
    get pendingCount() {
      return pending.size;
    },
    get ownedHandleCount() {
      return (
        timers.size +
        requests.size +
        responses.size +
        children.size +
        sockets.size +
        proxyAgents.size
      );
    },
  };
}

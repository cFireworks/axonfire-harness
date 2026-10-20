import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { AsyncLocalStorage } from "node:async_hooks";
import { createNativeUserPrompt } from "./native-user-prompt.js";
import {
  createResourcePromptHost,
  type ResourcePromptHostOptions,
} from "./resource-prompt-host.js";

/** ACP content blocks, not OpenAI AgentInputItems. Mapping is a separate protocol boundary. */
export type UserPromptRequest = {
  sessionId: string;
  cwd?: string;
  desiredConfig?: Record<string, any>;
  prompt: any[];
  _meta?: Record<string, any>;
  hasPriorUserMessages?: boolean;
};
export type UserPromptHostOptions = {
  stateDir: string;
  getWorkDir(): string;
  /** Explicit additional read roots for caller-owned expert / command plugin content. */
  pluginReadRoots?: string[];
  resourcePromptHost?: Awaited<ReturnType<typeof createResourcePromptHost>>;
  resourcePrompts?: Omit<ResourcePromptHostOptions, "stateDir" | "getWorkDir">;
  connectorService?: {
    getConfigs(): Promise<any[]>;
    getStates(): Promise<Record<string, any>>;
  };
  expertPluginService?: {
    resolveExpertAgentPromptSource(
      id: string,
      marketplace?: string,
    ): Promise<any>;
  };
  authenticationManager?: { currentSessionSubject: { getValue(): any } };
  productManager?: { getCurrentConfiguration(): any };
  projectNetdriveRootResolver?: (projectId: string) => Promise<any>;
  projectInstructionsResolver?: (projectId: string) => Promise<any>;
  /** External engine package is not reconstructed here. Required when its original feature gate is enabled. */
  tencentDocsEngine?: {
    renderTencentDocsRoutingPrompt(input: any): string[];
    renderTencentDocsSelectionPrompt(input: any): string[];
  };
  tencentDocsDocumentService?: {
    buildTurnDocumentRoutingContext(input: any): Promise<any>;
  };
  logger?: any;
  /** Deterministic, explicitly supplied clock/platform seams for verification. */
  runtime?: { Date?: any; Intl?: any; platform?: string };
};

/** Owned ACP composition host. Does not launch Electron, discover accounts, or call project APIs itself. */
export async function createUserPromptHost(options: UserPromptHostOptions) {
  const extraRoots = (options.pluginReadRoots ?? []).flatMap((p) => [
    path.resolve(p),
    fs.realpathSync(path.resolve(p)),
  ]);
  const resource =
    options.resourcePromptHost ??
    (await createResourcePromptHost({
      ...options.resourcePrompts,
      stateDir: options.stateDir,
      getWorkDir: options.getWorkDir,
    }));
  const ownedResource = !options.resourcePromptHost;
  const logger = Object.fromEntries(
    ["info", "warn", "error", "debug"].map((name) => [
      name,
      (...args: any[]) => options.logger?.[name]?.(...args),
    ]),
  );
  const pending = new Set<Promise<any>>();
  const operations = new AsyncLocalStorage<{ active: number }>();
  let closed = false,
    closing: Promise<void> | undefined;
  const inside = (root: string, file: string) => {
    const rel = path.relative(root, file);
    return (
      rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel)
    );
  };
  function readable(target: string) {
    if (closed && !operations.getStore()?.active)
      throw Error("User prompt host is closed");
    const file = path.resolve(target);
    const roots = [
      resource.root,
      path.resolve(options.getWorkDir()),
      resource.templatesDir,
      ...extraRoots,
    ];
    const root = roots.find((root) => inside(root, file));
    if (!root)
      throw Error(
        "User prompt read is outside owned state/project/templates/plugins",
      );
    // Check the nearest existing ancestor as well: nonexistent descendants of an external symlink are forbidden.
    let ancestor = file;
    while (!fs.existsSync(ancestor)) {
      const parent = path.dirname(ancestor);
      if (parent === ancestor) break;
      ancestor = parent;
    }
    if (!inside(fs.realpathSync(root), fs.realpathSync(ancestor)))
      throw Error("User prompt read traverses external symlink");
    return file;
  }
  function run<T>(callback: () => T): T {
    let operation = operations.getStore();
    if (closed && !operation?.active) throw Error("User prompt host is closed");
    operation = operation?.active ? operation : { active: 0 };
    operation.active++;
    let value: T;
    try {
      value = operations.run(operation, callback);
    } catch (error) {
      operation.active--;
      throw error;
    }
    if (value && typeof (value as any).then === "function") {
      const job = value as unknown as Promise<any>;
      pending.add(job);
      void job.then(
        () => {
          pending.delete(job);
          operation!.active--;
        },
        () => {
          pending.delete(job);
          operation!.active--;
        },
      );
    } else operation.active--;
    return value;
  }
  const readFs = {
    promises: {
      readFile: (file: string, ...args: any[]) =>
        (fs.promises.readFile as any)(readable(file), ...args),
      readdir: (file: string, ...args: any[]) =>
        (fs.promises.readdir as any)(readable(file), ...args),
      stat: (file: string, ...args: any[]) =>
        (fs.promises.stat as any)(readable(file), ...args),
    },
    existsSync(file: string) {
      try {
        return fs.existsSync(readable(file));
      } catch {
        return false;
      }
    },
    readFileSync: (file: string, ...args: any[]) =>
      (fs.readFileSync as any)(readable(file), ...args),
    readdirSync: (file: string, ...args: any[]) =>
      (fs.readdirSync as any)(readable(file), ...args),
  };
  const native = createNativeUserPrompt({
    ...options.runtime,
    fs: readFs,
    os: { ...os, homedir: () => resource.home },
    env: resource.env,
    getWorkDir: options.getWorkDir,
    logger,
    console: logger,
    resourcePromptNative: resource.native,
    // Exact two enum string values in the fixed common.js ProductFeature declaration.
    common: {
      ProductFeature: {
        TencentDocsAiEdit: "TencentDocsAiEdit",
        TencentDocsAiEditEnterprise: "TencentDocsAiEditEnterprise",
      },
    },
    tencentDocsEngine:
      options.tencentDocsEngine ??
      new Proxy(
        {},
        {
          get() {
            throw Error(
              "Tencent Docs prompt engine adapter is required when AI edit is enabled",
            );
          },
        },
      ),
    tencentDocsDocumentService: options.tencentDocsDocumentService,
  });
  const original = new native.WorkbuddyUserPromptService();
  Object.assign(original, {
    logger,
    systemPromptService: resource.service,
    connectorService: options.connectorService,
    expertPluginService: options.expertPluginService,
    authenticationManager: options.authenticationManager,
    productManager: options.productManager,
  });
  original.setProjectNetdriveRootResolver(options.projectNetdriveRootResolver);
  original.setProjectInstructionsResolver(options.projectInstructionsResolver);
  const service = new Proxy(original, {
    get(target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== "function") return value;
      return (...args: any[]) => {
        try {
          return run(() => Reflect.apply(value, target, args));
        } catch (error) {
          if (value.constructor.name === "AsyncFunction")
            return Promise.reject(error);
          throw error;
        }
      };
    },
  });
  try {
    await service.initialize();
  } catch (error) {
    if (ownedResource) await resource.close();
    throw error;
  }
  async function flush() {
    while (pending.size) await Promise.allSettled([...pending]);
    await resource.flush();
  }
  return {
    service,
    resourcePromptHost: resource,
    composeUserPrompt: (request: UserPromptRequest): Promise<any[]> =>
      service.composeUserPrompt(request),
    flush,
    close() {
      if (closing) return closing;
      closed = true;
      closing = (async () => {
        await flush();
        original.cleanup();
        // Original cleanup does not clear the routing-rule FIFO on the cached Docs section.
        // Release this host's section graph at disposal, without changing the original method.
        original.sections = undefined;
        if (ownedResource) await resource.close();
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
  };
}

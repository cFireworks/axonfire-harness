import * as fs from "node:fs";
import * as path from "node:path";
import { BehaviorSubject } from "rxjs";
import { AsyncLocalStorage } from "node:async_hooks";
import { createNativeSettingsManager } from "./native-settings-manager.js";
import { createNativeCliSettings } from "./native-cli-settings.js";
import { createCapturedSettingsConstants } from "../vendor/captured-settings-constants.js";
import { createOwnedSettingsFilesystem } from "./owned-settings-filesystem.js";
import { FileLockService } from "../tasks/file-lock-service.js";
import { createOwnedPluginFilesystem } from "../plugins/owned-plugin-filesystem.js";
export type NativeSettingsHostOptions = {
  cliOptions?: Record<string, any>;
  dependencies?: Record<string, any>;
  runtime?: Record<string, any>;
};
/** Original manager/providers, standalone scope paths and lifecycle ownership. */
export function createNativeSettingsHost(options: {
  stateDir: string;
  getWorkDir(): string;
  fileLockService?: any;
  logger: any;
  cwdService?: { onDidChangeCwd: { subscribe(callback: () => void): any } };
  configuration?: NativeSettingsHostOptions;
}) {
  let closed = false,
    started = false,
    cliOptions = { ...options.configuration?.cliOptions };
  const pending = new Set<Promise<any>>(),
    subscriptions = new Set<any>(),
    timers = new Set<any>();
  const changes = new BehaviorSubject<any>(undefined),
    constants: any = createCapturedSettingsConstants();
  const operations = new AsyncLocalStorage<{
    pending: number;
    active: boolean;
  }>();
  const ownedFs = options.fileLockService
    ? undefined
    : createOwnedPluginFilesystem(options.stateDir);
  const lockDirectory = path.join(options.stateDir, "tmp");
  const lock = ownedFs
    ? new FileLockService(lockDirectory, { fs: ownedFs })
    : undefined;
  const fileLockService = options.fileLockService ?? {
    async acquireFileLock(name: string, configuration: any) {
      await ownedFs!.ensureDir(lockDirectory);
      return lock!.acquireFileLock(name, configuration);
    },
  };
  function own<T>(p: Promise<T>) {
    pending.add(p);
    void p.then(
      () => pending.delete(p),
      () => pending.delete(p),
    );
    return p;
  }
  function instrument(service: any) {
    for (const name of Object.getOwnPropertyNames(
      Object.getPrototypeOf(service),
    )) {
      if (
        name === "constructor" ||
        typeof Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(service),
          name,
        )?.value !== "function"
      )
        continue;
      const native = service[name].bind(service);
      service[name] = (...args: any[]) => {
        const parent = operations.getStore();
        if (closed && !parent?.active) {
          const error = Error("Settings host is closed");
          if (native.constructor.name === "AsyncFunction")
            return own(Promise.reject(error));
          throw error;
        }
        const operation = parent?.active
          ? parent
          : { pending: 0, active: true };
        operation.pending++;
        const finish = () => {
          if (--operation.pending === 0) operation.active = false;
        };
        let value;
        try {
          value = operations.run(operation, () => native(...args));
        } catch (error) {
          finish();
          throw error;
        }
        if (value?.then) {
          const job = own(value);
          void job.then(finish, finish);
          return job;
        }
        finish();
        return value;
      };
    }
    return service;
  }
  const logger = Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error"].map((k) => [
      k,
      (...args: any[]) => options.logger?.[k]?.(...args),
    ]),
  );
  const dependencies: any = {
    startupProfiler: { markStart() {}, markEnd() {} },
    ...options.configuration?.dependencies,
  };
  const runtime: any = {
    constants,
    dependencies,
    getHomeDir: () => options.stateDir,
    getWorkDir: options.getWorkDir,
    fsPromises: createOwnedSettingsFilesystem(
      () => options.stateDir,
      options.getWorkDir,
    ),
    setTimeout(fn: () => void, ms: number) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        fn();
      }, ms);
      timers.add(timer);
      return timer;
    },
    ...options.configuration?.runtime,
  };
  const classes = createNativeSettingsManager(runtime),
    cliClasses = createNativeCliSettings({
      ...runtime,
      fs,
      resolveFilePathToWorkDir: (file: string) =>
        path.resolve(options.getWorkDir(), file),
    });
  const cliDeps = {
    logger,
    cliProvider: { parseOpts: () => ({ opts: cliOptions }) },
    cliRuntimeOptions: {
      onDidChange: {
        subscribe(fn: any) {
          const s = changes.subscribe(fn);
          subscriptions.add(s);
          return s;
        },
      },
    },
  };
  const sources = instrument(
    Object.assign(new cliClasses.CliSettingSourcesProvider(), cliDeps),
  );
  const cli = instrument(
    Object.assign(new cliClasses.CliSettingsProvider(), cliDeps),
  );
  const manager = instrument(
    Object.assign(new classes.SettingsManagerImpl(), {
      logger,
      fileLockService,
      cliSettingsProvider: cli,
      cliSettingSourcesProvider: sources,
    }),
  );
  const controller = Object.assign(new classes.SettingsController(), {
    settingsManager: manager,
  });
  async function ready() {
    await Promise.all([
      sources.waitUntilSettled(),
      cli.waitUntilSettled(),
      sources.getSettingScopes(),
      cli.getSettings(),
    ]);
  }
  sources.init();
  cli.init();
  if (options.cwdService?.onDidChangeCwd)
    subscriptions.add(
      options.cwdService.onDidChangeCwd.subscribe(() => manager.clearCache()),
    );
  return {
    manager,
    sources,
    cli,
    controller,
    classes,
    cliClasses,
    constants,
    runtime,
    async start() {
      if (closed) throw Error("Settings host is closed");
      if (started) return;
      started = true;
      await own(ready());
    },
    ready: () => own(ready()),
    async updateCliOptions(next: Record<string, any>) {
      if (closed) throw Error("Settings host is closed");
      cliOptions = { ...next };
      changes.next(undefined);
      await own(ready());
    },
    attach(deps: Record<string, any>) {
      Object.assign(dependencies, deps);
    },
    async flush() {
      while (pending.size) await Promise.allSettled([...pending]);
    },
    async close() {
      closed = true;
      for (const s of subscriptions) s.unsubscribe();
      subscriptions.clear();
      changes.complete();
      while (pending.size) await Promise.allSettled([...pending]);
      for (const t of timers) clearTimeout(t);
      timers.clear();
      sources.onDidChangeEmitter.dispose();
      manager.onDidChangeEmitter.dispose();
      operations.disable();
    },
    get ownedHandleCount() {
      return timers.size + subscriptions.size;
    },
    get pendingCount() {
      return pending.size;
    },
  };
}

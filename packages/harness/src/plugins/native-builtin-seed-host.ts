import * as path from "node:path";
import { createNativeBuiltinSeed } from "./native-builtin-seed.js";
import { createNativeBundledAssets } from "./native-bundled-assets.js";
import { createOwnedBuiltinSeedFilesystem } from "./owned-builtin-seed-filesystem.js";
export type NativeBuiltinSeedOptions = {
  /** Directory containing plugins/workbuddy-builtin. Explicit trusted packaged resources only. */
  assetsRoot: string;
  appVersion?: string;
  /** Explicit Electron-style Resources location, never discovered from an installed app. */
  resourcesPath?: string;
  platform?: NodeJS.Platform;
  runtime?: Record<string, any>;
};
/** Local ownership/DI bridge; materialization/default decisions and metadata controller remain original. */
export function createNativeBuiltinSeedHost(options: {
  stateDir: string;
  getProductFeatures(): any;
  controller: any;
  refresh: any;
  logger: any;
  configuration?: NativeBuiltinSeedOptions | undefined;
}) {
  let closed = false,
    tail = Promise.resolve<any>(undefined);
  const pending = new Set<Promise<any>>();
  const assets = createNativeBundledAssets({
    process: {
      cwd: () => options.stateDir,
      resourcesPath: options.configuration?.resourcesPath,
    },
  });
  if (options.configuration?.assetsRoot)
    assets.setBundledAssetsRoot(path.resolve(options.configuration.assetsRoot));
  const runtime: any = {
    fs: createOwnedBuiltinSeedFilesystem(options.stateDir),
    process: {
      pid: process.pid,
      platform: options.configuration?.platform ?? process.platform,
    },
    getConfigDir: () => options.stateDir,
    getAppVersion: () => options.configuration?.appVersion ?? "5.3.14",
    resolveBundledAsset(...segments: string[]) {
      if (!options.configuration?.assetsRoot) return undefined;
      return assets.resolveBundledAsset(...segments);
    },
    console: Object.fromEntries(
      ["info", "warn", "error"].map((k) => [
        k,
        (...args: any[]) => options.logger?.[k]?.(...args),
      ]),
    ),
    ...options.configuration?.runtime,
  };
  const native = createNativeBuiltinSeed(runtime);
  return {
    native,
    assets,
    runtime,
    seed(productFeatures = options.getProductFeatures()) {
      if (closed) return Promise.reject(Error("Builtin seed host is closed"));
      const job = tail.then(async () => {
        const materialization =
          native.seedBuiltinPluginsMarketplace(productFeatures);
        const metadata = materialization.metadataRequest
          ? await options.controller.reconcileWorkbuddyBuiltin(
              materialization.metadataRequest,
            )
          : undefined;
        // Settings writes can synchronously enqueue another native refresh.
        await options.refresh.waitForRefreshSettled();
        return { materialization, metadata };
      });
      pending.add(job);
      void job.then(
        () => pending.delete(job),
        () => pending.delete(job),
      );
      tail = job.catch(() => undefined);
      return job;
    },
    async close() {
      closed = true;
      await tail;
      while (pending.size) await Promise.allSettled([...pending]);
    },
    get pendingCount() {
      return pending.size;
    },
    get ownedHandleCount() {
      return 0;
    },
    get closed() {
      return closed;
    },
  };
}

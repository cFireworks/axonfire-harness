import { join } from "node:path";
import { createNativeMarketplace } from "../../src/plugins/native-marketplace.js";
import { createNativeFileLock } from "../../src/tasks/native-file-lock.js";
import { createOwnedPluginFilesystem } from "../../src/plugins/owned-plugin-filesystem.js";
export function marketplaceFixture(
  root: string,
  factories = {
    marketplace: createNativeMarketplace,
    locks: createNativeFileLock,
  },
  overrides: any = {},
) {
  const events: any[] = [],
    errors: any[] = [],
    scopes = new Map<string, any>();
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error", "setContext"].map((k) => [
      k,
      (...args: any[]) => events.push([k, ...args]),
    ]),
  );
  const fsExtra = createOwnedPluginFilesystem(root),
    errorCollector = { addError: (e: any) => errors.push(e) };
  const nativeLock = new (factories.locks({
    fs: fsExtra,
    tmpdir: () => join(root, "tmp"),
  }).FileLockServiceImpl)();
  const fileLockService = {
    async acquireFileLock(name: string, opts?: any) {
      await fsExtra.ensureDir(join(root, "tmp"));
      return nativeLock.acquireFileLock(name, opts);
    },
  };
  const configuration: any = { builtInMarketplaces: {} },
    productManager = { getCurrentConfiguration: () => configuration };
  const runtime = {
    fsExtra,
    getHomePluginsDir: () => join(root, "plugins"),
    services: { logger, errorCollector, productManager },
    ...overrides,
  };
  const classes = factories.marketplace(runtime);
  const installer = Object.assign(new classes.LocalPluginInstaller(), {
    errorCollector,
  });
  classes.installers.push(installer);
  const storage = Object.assign(new classes.MarketplaceStorage(), {
    logger,
    errorCollector,
    fileLockService,
  });
  const config = Object.assign(new classes.MarketplaceConfigManager(), {
    logger,
    marketplaceStorage: storage,
    settingsManager: {
      get: async (_: string, scope: string) => scopes.get(scope),
    },
    cliSettingSourcesProvider: {
      isScopeAllowed: async (_scope: string) => true,
    },
  });
  const builtIn = Object.assign(new classes.BuiltInMarketplaceProvider(), {
    logger,
  });
  storage.init();
  config.init();
  builtIn.init();
  return {
    root,
    runtime,
    classes,
    storage,
    config,
    builtIn,
    installer,
    nativeLock,
    fileLockService,
    scopes,
    configuration,
    fsExtra,
    errors,
    events,
  };
}

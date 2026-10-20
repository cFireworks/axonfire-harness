import { createOwnedPluginFilesystem } from "../../src/plugins/owned-plugin-filesystem.js";
import { createNativePluginInstallers } from "../../src/plugins/native-plugin-installers.js";
import { createNativePluginStorage } from "../../src/plugins/native-plugin-storage.js";
export function pluginInstallerFixture(
  root: string,
  factories: any = {
    installers: createNativePluginInstallers,
    storage: createNativePluginStorage,
  },
  overrides: any = {},
) {
  const events: any[] = [],
    fsExtra = createOwnedPluginFilesystem(root),
    settingsData: any = {};
  let id = 0;
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error", "setContext"].map((k) => [
      k,
      (...args: any[]) => events.push([k, ...args]),
    ]),
  );
  const runtime = {
    fsExtra,
    getHomeDir: () => root,
    process: { env: { OWNED: "fixture" } },
    uuid: () => "owned-" + ++id,
    ...overrides,
  };
  const storageClasses = factories.storage(runtime),
    errorCollector = new storageClasses.PluginErrorCollector();
  const settings = {
    get: async (key: string, _scope?: string) => settingsData[key],
    set: async (key: string, value: any, _scope?: string) => {
      settingsData[key] = value;
    },
    list: async (_scope?: string) => settingsData,
  };
  const options = Object.assign(new storageClasses.PluginOptionsStorageImpl(), {
    logger,
    settingsManager: settings,
  });
  options.init();
  const installerClasses = factories.installers(runtime),
    git = Object.assign(new installerClasses.GitPluginInstaller(), {
      errorCollector,
    }),
    npm = Object.assign(new installerClasses.NpmPluginInstaller(), { logger }),
    subdir = Object.assign(new installerClasses.GitSubdirPluginInstaller(), {
      logger,
    });
  npm.init();
  subdir.init();
  return {
    root,
    runtime,
    fsExtra,
    events,
    logger,
    settingsData,
    settings,
    storageClasses,
    installerClasses,
    errorCollector,
    options,
    git,
    npm,
    subdir,
  };
}

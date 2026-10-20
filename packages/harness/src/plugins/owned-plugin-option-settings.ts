import * as path from "node:path";
/** Standalone USER/pluginConfigs adapter only, not the original full SettingsManager. */
export function createOwnedPluginOptionSettings(
  stateDir: string,
  fsExtra: any,
) {
  const file = path.join(stateDir, "plugins", "plugin-options.json");
  let tail = Promise.resolve();
  function validate(key: string, scope: string) {
    if (key !== "pluginConfigs" || scope !== "user")
      throw Error(
        "Standalone plugin option settings only support USER/pluginConfigs",
      );
  }
  async function read() {
    if (!(await fsExtra.pathExists(file))) return {};
    const value = JSON.parse(await fsExtra.readFile(file, "utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw Error("Plugin option settings must be a JSON object");
    return value;
  }
  return {
    file,
    async get(key: string, scope: string) {
      validate(key, scope);
      return (await read()).pluginConfigs;
    },
    async list(scope: string) {
      validate("pluginConfigs", scope);
      return read();
    },
    set(key: string, value: any, scope: string) {
      validate(key, scope);
      const result = tail.then(async () => {
        const object = await read();
        object.pluginConfigs = value;
        await fsExtra.ensureDir(path.dirname(file));
        const temp = file + ".tmp." + process.pid;
        try {
          await fsExtra.writeFile(
            temp,
            JSON.stringify(object, null, 2),
            "utf8",
          );
          await fsExtra.rename(temp, file);
        } catch (error) {
          await fsExtra.remove(temp).catch(() => {});
          throw error;
        }
      });
      tail = result.then(
        () => {},
        () => {},
      );
      return result;
    },
    close: () => tail,
  };
}

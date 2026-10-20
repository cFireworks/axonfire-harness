import * as fs from "node:fs";
import * as path from "node:path";
/** Only the original three settings files, their .tmp files and parent mkdir are writable. Not an OS sandbox. */
export function createOwnedSettingsFilesystem(
  getHomeDir: () => string,
  getWorkDir: () => string,
) {
  function paths() {
    return [
      path.join(getHomeDir(), "settings.json"),
      path.join(getWorkDir(), ".codebuddy", "settings.json"),
      path.join(getWorkDir(), ".codebuddy", "settings.local.json"),
    ].map((p) => path.resolve(p));
  }
  function check(target: string, directory = false) {
    const full = path.resolve(target),
      files = paths();
    if (
      !files.some((file) =>
        directory
          ? path.dirname(file) === full
          : full === file || full === file + ".tmp",
      )
    )
      throw Error("Settings write is outside configured scope files");
    const root =
      full.startsWith(path.resolve(getHomeDir()) + path.sep) ||
      full === path.resolve(getHomeDir())
        ? path.resolve(getHomeDir())
        : path.resolve(getWorkDir());
    if (fs.existsSync(root)) {
      // existsSync follows links and misses dangling links; a later write would
      // otherwise follow one outside the allowed tree and create its target.
      const existsEntry = (entry: string) => {
        try {
          fs.lstatSync(entry);
          return true;
        } catch (error: any) {
          if (error.code === "ENOENT") return false;
          throw error;
        }
      };
      let ancestor = existsEntry(full) ? full : path.dirname(full);
      while (!existsEntry(ancestor)) ancestor = path.dirname(ancestor);
      const rel = path.relative(
        fs.realpathSync(root),
        fs.realpathSync(ancestor),
      );
      if (
        rel === ".." ||
        rel.startsWith(".." + path.sep) ||
        path.isAbsolute(rel)
      )
        throw Error("Settings write traverses an external symlink");
    }
    return full;
  }
  return {
    readFile: fs.promises.readFile,
    mkdir: (target: string, options: any) =>
      fs.promises.mkdir(check(target, true), options),
    writeFile: (target: string, ...args: any[]) =>
      (fs.promises.writeFile as any)(check(target), ...args),
    rename: (from: string, to: string) =>
      fs.promises.rename(check(from), check(to)),
    unlink: (target: string) => fs.promises.unlink(check(target)),
  };
}

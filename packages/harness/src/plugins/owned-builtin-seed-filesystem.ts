import * as fs from "node:fs";
import * as path from "node:path";
/** Synchronous Desktop seam, restricted to this host's plugins tree. Not an OS sandbox. */
export function createOwnedBuiltinSeedFilesystem(stateDir: string) {
  const state = path.resolve(stateDir),
    plugins = path.join(state, "plugins");
  function inside(root: string, target: string) {
    const rel = path.relative(root, target);
    return (
      !rel ||
      (rel !== ".." &&
        !rel.startsWith(".." + path.sep) &&
        !path.isAbsolute(rel))
    );
  }
  function entryExists(file: string) {
    try {
      fs.lstatSync(file);
      return true;
    } catch (error: any) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
  }
  function check(file: string, followFinal: boolean, allowState = false) {
    const target = path.resolve(file);
    if ((!allowState || target !== state) && !inside(plugins, target))
      throw Error("Builtin seed write is outside owned plugins");
    if (target === state && allowState) return target;
    if (!fs.existsSync(state))
      throw Error("Builtin seed state directory is not initialized");
    let ancestor =
      followFinal && entryExists(target) ? target : path.dirname(target);
    while (!entryExists(ancestor)) ancestor = path.dirname(ancestor);
    if (!inside(fs.realpathSync(state), fs.realpathSync(ancestor)))
      throw Error("Builtin seed write traverses an external symlink");
    return target;
  }
  return {
    existsSync: fs.existsSync,
    readdirSync: fs.readdirSync,
    lstatSync: fs.lstatSync,
    realpathSync: fs.realpathSync,
    readFileSync: fs.readFileSync,
    closeSync: fs.closeSync,
    openSync(file: string, flags: any) {
      if (flags !== "r")
        throw Error("Builtin seed open only permits read probes");
      return fs.openSync(file, flags);
    },
    mkdirSync(file: string, options?: any) {
      return fs.mkdirSync(check(file, true, true), options);
    },
    copyFileSync(from: string, to: string, flags?: number) {
      return fs.copyFileSync(from, check(to, true), flags);
    },
    writeFileSync(file: string, ...args: any[]) {
      return (fs.writeFileSync as any)(check(file, true), ...args);
    },
    unlinkSync(file: string) {
      return fs.unlinkSync(check(file, false));
    },
    rmdirSync(file: string) {
      const target = check(file, false);
      if (target === plugins) throw Error("Cannot remove owned plugins root");
      return fs.rmdirSync(target);
    },
    renameSync(from: string, to: string) {
      return fs.renameSync(check(from, false), check(to, false));
    },
  };
}

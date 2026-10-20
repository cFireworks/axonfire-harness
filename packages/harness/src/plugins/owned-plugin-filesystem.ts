import * as fs from "node:fs";
import * as path from "node:path";
/** Node filesystem bridge, not the original fs-extra package. Writes are owned-state only. */
export function createOwnedPluginFilesystem(stateDir: string) {
  const root = path.resolve(stateDir);
  function assertWrite(target: string) {
    const full = path.resolve(target),
      rel = path.relative(root, full);
    if (
      !rel ||
      rel === ".." ||
      rel.startsWith(".." + path.sep) ||
      path.isAbsolute(rel)
    )
      throw Error("Plugin write is outside owned state");
    let ancestor = path.dirname(full);
    while (!fs.existsSync(ancestor)) {
      const next = path.dirname(ancestor);
      if (next === ancestor) break;
      ancestor = next;
    }
    const real = fs.realpathSync(ancestor);
    if (fs.existsSync(root)) {
      const realRoot = fs.realpathSync(root),
        realRel = path.relative(realRoot, real);
      if (
        realRel === ".." ||
        realRel.startsWith(".." + path.sep) ||
        path.isAbsolute(realRel)
      )
        throw Error("Plugin write traverses an external symlink");
    }
    return full;
  }
  return {
    ...fs.promises,
    async pathExists(target: string) {
      try {
        await fs.promises.access(target);
        return true;
      } catch {
        return false;
      }
    },
    async readJSON(target: string) {
      return JSON.parse(await fs.promises.readFile(target, "utf8"));
    },
    async writeJSON(target: string, value: any, options: any = {}) {
      return fs.promises.writeFile(
        assertWrite(target),
        JSON.stringify(value, null, options.spaces) + (options.EOL ?? "\n"),
        "utf8",
      );
    },
    async ensureDir(target: string) {
      if (path.resolve(target) === root)
        return fs.promises.mkdir(root, { recursive: true });
      return fs.promises.mkdir(assertWrite(target), { recursive: true });
    },
    async mkdirp(target: string) {
      return this.ensureDir(target);
    },
    async writeFile(target: string, ...args: any[]) {
      return (fs.promises.writeFile as any)(assertWrite(target), ...args);
    },
    async copyFile(from: string, to: string, ...args: any[]) {
      return (fs.promises.copyFile as any)(from, assertWrite(to), ...args);
    },
    async symlink(target: string, link: string, type?: any) {
      return fs.promises.symlink(target, assertWrite(link), type);
    },
    async chmod(target: string, mode: number) {
      return fs.promises.chmod(assertWrite(target), mode);
    },
    async rename(from: string, to: string) {
      return fs.promises.rename(assertWrite(from), assertWrite(to));
    },
    async mkdtemp(prefix: string) {
      return fs.promises.mkdtemp(assertWrite(prefix));
    },
    async remove(target: string) {
      return fs.promises.rm(assertWrite(target), {
        recursive: true,
        force: true,
      });
    },
    removeSync(target: string) {
      fs.rmSync(assertWrite(target), { recursive: true, force: true });
    },
  };
}

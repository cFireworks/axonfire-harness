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
      if (fs.existsSync(full)) {
        const targetRel = path.relative(realRoot, fs.realpathSync(full));
        if (
          targetRel === ".." ||
          targetRel.startsWith(".." + path.sep) ||
          path.isAbsolute(targetRel)
        )
          throw Error("Plugin write target is an external symlink");
      }
    }
    return full;
  }
  return {
    assertWritePath: assertWrite,
    createReadStream: fs.createReadStream,
    createWriteStream(target: string, options?: any) {
      return fs.createWriteStream(assertWrite(target), options);
    },
    access: fs.promises.access,
    readFile: fs.promises.readFile,
    readdir: fs.promises.readdir,
    stat: fs.promises.stat,
    lstat: fs.promises.lstat,
    realpath: fs.promises.realpath,
    readlink: fs.promises.readlink,
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
      if (path.resolve(target) === root)
        return fs.promises.mkdir(root, { recursive: true });
      return fs.promises.mkdir(assertWrite(target), { recursive: true });
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
    async mkdir(target: string, options?: any) {
      return fs.promises.mkdir(assertWrite(target), options);
    },
    async rm(target: string, options?: any) {
      return fs.promises.rm(assertWrite(target), options);
    },
    async unlink(target: string) {
      return fs.promises.unlink(assertWrite(target));
    },
    async utimes(target: string, atime: any, mtime: any) {
      return fs.promises.utimes(assertWrite(target), atime, mtime);
    },
    async move(
      from: string,
      to: string,
      options: { overwrite?: boolean } = {},
    ) {
      const source = assertWrite(from),
        target = assertWrite(to);
      if (source === target) return;
      await fs.promises.mkdir(path.dirname(target), { recursive: true });
      if (options.overwrite)
        await fs.promises.rm(target, { recursive: true, force: true });
      else if (fs.existsSync(target))
        throw Object.assign(Error("Destination already exists"), {
          code: "EEXIST",
        });
      try {
        await fs.promises.rename(source, target);
      } catch (error: any) {
        if (error.code !== "EXDEV") throw error;
        await fs.promises.cp(source, target, {
          recursive: true,
          errorOnExist: true,
          force: false,
        });
        await fs.promises.rm(source, { recursive: true, force: true });
      }
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

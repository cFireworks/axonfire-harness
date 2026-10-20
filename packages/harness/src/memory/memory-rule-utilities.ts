import * as path from "node:path";
import * as eH from "./memory-rule-constants.js";
import { MemoryMarkdownUtils } from "./native-memory-markdown.js";
import { CapturedMinimatch } from "../vendor/captured-minimatch.js";
export type MemoryRuleUtilityRuntime = {
  getWorkDir(): string;
  getHomeDir(): string;
  getUserHomeDir(): string;
  platform: NodeJS.Platform;
  fs: any;
};
export function createMemoryRuleUtilities(runtime: MemoryRuleUtilityRuntime) {
  const ef = path,
    em = () => path,
    ep = runtime.fs,
    eC = eH,
    e$ = path,
    eh = { homedir: runtime.getUserHomeDir },
    td = eh,
    tp = { PathUtils: { getWorkDir: runtime.getWorkDir } },
    tg = /@([^\s\n]+)/g,
    e7 = CapturedMinimatch;
  class PathUtils {
    static getWorkDir = runtime.getWorkDir;
    static getHomeDir = runtime.getHomeDir;
    static getMemoryFilePath(eA: any): any {
      if (eA === eC.MemoryScope.USER)
        return (0, ef.join)(PathUtils.getHomeDir(), eC.MEMORY_FILENAME);
      if (eA !== eC.MemoryScope.PROJECT)
        return (0, ef.join)(PathUtils.getWorkDir(), eC.MEMORY_LOCAL_FILENAME);
      {
        let eA: any = PathUtils.getWorkDir(),
          el: any = (0, ef.join)(eA, eC.MEMORY_FILENAME),
          ec: any = (0, ef.join)(eA, eC.AGENTS_FILENAME);
        try {
          return ((0, ep.accessSync)(el), el);
        } catch {
          try {
            return ((0, ep.accessSync)(ec), ec);
          } catch {
            return el;
          }
        }
      }
    }
    static isPathInside(eA: any, el: any): any {
      let ec: any = em().relative(el, eA);
      return !!(
        ec &&
        ".." !== ec &&
        !ec.startsWith(`..${em().sep}`) &&
        ec !== em().resolve(eA)
      );
    }
    static resolveFilePathToWorkDir(eA: any, el?: any): any {
      if (
        (eA.startsWith("file://")
          ? (eA = eA.replace(/^file:\/\//, ""))
          : eA.startsWith("file:") && (eA = eA.replace(/^file:/, "")),
        eA.startsWith("~/"))
      )
        return (0, ef.resolve)((0, eh.homedir)(), eA.slice(2));
      if (em().isAbsolute(eA)) return PathUtils.unixToWindowsPath(eA);
      el || (el = PathUtils.getWorkDir());
      let ec: any = PathUtils.normalizePathSeparators(eA);
      if (ec.startsWith("@")) {
        let eA: any = ec.slice(1),
          eu: any = em().resolve(el, ec);
        try {
          return ((0, ep.accessSync)(eu), eu);
        } catch {
          return em().resolve(el, eA);
        }
      }
      return em().resolve(el, ec);
    }
    static normalizePathSeparators(eA: any): any {
      return "win32" === runtime.platform ? eA : eA.replace(/\\/g, "/");
    }
    static unixToWindowsPath(eA: any): any {
      if ("win32" !== runtime.platform) return eA;
      let el: any = eA.match(/^\/([a-zA-Z])\//);
      if (el) {
        let ec: any = el[1].toUpperCase(),
          eu: any = eA.slice(3);
        return em().win32.resolve(`${ec}:\\`, eu);
      }
      return em().win32.normalize(eA);
    }
  }
  class ImportUtils {
    static extractImports(eA: any, el: any): any {
      let ec: any = [],
        eu: any = RegExp(tg.source, "g");
      for (let ed of eA.matchAll(eu)) {
        let [eu, ep] = ed,
          eg: any = ed.index;
        if (ImportUtils.isInCodeBlock(eA, eg)) continue;
        let eh: any = ImportUtils.resolveImportPath(ep, el);
        ec.push({ fullMatch: eu, importPath: ep, index: eg, resolvedPath: eh });
      }
      return ec;
    }
    static resolveImportPath(eA: any, el: any): any {
      if (eA.startsWith("~/"))
        return (0, e$.resolve)((0, td.homedir)(), eA.slice(2));
      if ((0, e$.isAbsolute)(eA)) return (0, e$.resolve)(eA);
      let ec: any = el ? (0, e$.dirname)(el) : tp.PathUtils.getWorkDir();
      return (0, e$.resolve)(ec, eA);
    }
    static isInCodeBlock(eA: any, el: any): any {
      let ec: any = eA.substring(0, el),
        eu: any = (ec.match(/```/g) || []).length,
        ed: any = (ec.match(/(?<!`)(`(?!`))/g) || []).length;
      return eu % 2 == 1 || ed % 2 == 1;
    }
  }
  class GlobUtils {
    static isValidPattern(eA: any): any {
      if (!eA || !eA.trim()) return !1;
      try {
        return ((0, e7.minimatch)("test.ts", eA), !0);
      } catch {
        return !1;
      }
    }
    static match(eA: any, el: any, ec: any): any {
      try {
        return (0, e7.minimatch)(eA, el, ec);
      } catch {
        return !1;
      }
    }
    static normalizePath(eA: any): any {
      return eA.replace(/\\/g, "/");
    }
  }
  class MemoryLoadContextUtils {
    static create(): any {
      return {
        loadedMemories: new Map(),
        visitedFilePaths: new Set(),
        visitedDirectories: new Set(),
        importDepth: 0,
      };
    }
    static createChild(eA: any): any {
      return {
        loadedMemories: eA.loadedMemories,
        visitedFilePaths: new Set(eA.visitedFilePaths),
        visitedDirectories: eA.visitedDirectories,
        importDepth: eA.importDepth + 1,
      };
    }
  }
  return {
    PathUtils,
    ImportUtils,
    GlobUtils,
    MemoryLoadContextUtils,
    MarkdownUtils: MemoryMarkdownUtils,
    MAX_IMPORT_DEPTH: 5,
    FileUtils: {
      isDirectory: async (path: string) => {
        try {
          return (await runtime.fs.stat(path)).isDirectory();
        } catch {
          return false;
        }
      },
    },
  };
}

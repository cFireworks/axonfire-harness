import * as path from "node:path";
import { createMemoryRuleUtilities } from "../../src/memory/memory-rule-utilities.js";
import * as services from "../../src/memory/native-memory-services.js";
export function memoryRuleFixture(captured?: any) {
  const files = new Map<string, string>(),
    dirs = new Set<string>(["/"]),
    links = new Map<string, string>(),
    errors = new Map<string, any>(),
    events: any[] = [],
    logs: any[] = [],
    hooks: any[] = [];
  let cwd = "/owned/project/work";
  const home = "/owned/home";
  const error = (filename: string, code = "ENOENT") =>
    Object.assign(Error(code + ": " + filename), { code });
  function real(filename: string): string {
    if (links.has(filename)) return real(links.get(filename)!);
    let parent = path.dirname(filename);
    if (parent !== filename && links.has(parent))
      return path.join(real(parent), path.basename(filename));
    return filename;
  }
  const io: any = {
    async readFile(filename: string) {
      events.push(["read", filename]);
      if (errors.has(filename)) throw errors.get(filename);
      const key = real(filename);
      if (!files.has(key)) throw error(filename);
      return files.get(key);
    },
    async writeFile(filename: string, text: string) {
      events.push(["write", filename, text]);
      files.set(real(filename), text);
    },
    async mkdir(filename: string) {
      events.push(["mkdir", filename]);
      for (let p = filename; ; p = path.dirname(p)) {
        dirs.add(p);
        if (path.dirname(p) === p) break;
      }
    },
    async realpath(filename: string) {
      events.push(["realpath", filename]);
      if (errors.has(filename)) throw errors.get(filename);
      const key = real(filename);
      if (!files.has(key) && !dirs.has(key)) throw error(filename);
      return key;
    },
    async stat(filename: string) {
      if (errors.has(filename)) throw errors.get(filename);
      const key = real(filename);
      if (!files.has(key) && !dirs.has(key)) throw error(filename);
      return { isFile: () => files.has(key), isDirectory: () => dirs.has(key) };
    },
    accessSync(filename: string) {
      if (!files.has(real(filename)) && !dirs.has(real(filename)))
        throw error(filename);
    },
    async readdir(filename: string) {
      const entries = new Map<string, any>();
      for (const entry of [...dirs, ...files.keys(), ...links.keys()])
        if (entry !== filename && path.dirname(entry) === real(filename)) {
          const name = path.basename(entry);
          entries.set(name, {
            name,
            isSymbolicLink: () => links.has(entry),
            isDirectory: () => dirs.has(entry),
            isFile: () => files.has(entry),
          });
        }
      return [...entries.values()];
    },
  };
  const logger = Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error"].map((k) => [
      k,
      (...args: any[]) => logs.push([k, ...args]),
    ]),
  );
  const utilityRuntime = {
    getWorkDir: () => cwd,
    getHomeDir: () => home,
    getUserHomeDir: () => "/owned/os-home",
    platform: process.platform,
    fs: io,
    isDirectory: async (filename: string) => {
      try {
        return (await io.stat(filename)).isDirectory();
      } catch {
        return false;
      }
    },
  };
  const runtime: any = {
    fs: io,
    utilities: captured
      ? captured.utilities(utilityRuntime)
      : createMemoryRuleUtilities(utilityRuntime),
    dependencies: { logger },
    getHookManager: () => ({
      hasHooks: async () => true,
      executeHooks: async (event: any, input: any) =>
        hooks.push([event, input]),
    }),
  };
  const names = [
    "MemoryManagerImpl",
    "MemoryLoaderImpl",
    "MemoryParserImpl",
    "MemoryCacheImpl",
    "MemoryValidatorImpl",
    "GlobMatcherImpl",
    "SubdirectoryMemoryLoaderImpl",
    "ConditionalRulesServiceImpl",
  ];
  const instances = names.map((name) =>
    captured
      ? captured.construct(name, runtime)
      : new (services as any)[name](runtime),
  );
  const [
    manager,
    loader,
    parser,
    cache,
    validator,
    globMatcher,
    subdirLoader,
    conditionalRules,
  ] = instances;
  Object.assign(runtime.dependencies, {
    memoryManager: manager,
    memoryLoader: loader,
    memoryCache: cache,
    parser,
    validator,
    globMatcher,
    subdirLoader,
  });
  for (const value of instances) {
    Object.assign(value, runtime.dependencies);
    value.initialize?.();
  }
  function add(filename: string, content: string) {
    files.set(filename, content);
    for (let p = path.dirname(filename); ; p = path.dirname(p)) {
      dirs.add(p);
      if (path.dirname(p) === p) break;
    }
  }
  for (const dir of [cwd, home])
    for (let p = dir; ; p = path.dirname(p)) {
      dirs.add(p);
      if (path.dirname(p) === p) break;
    }
  return {
    runtime,
    manager,
    loader,
    parser,
    cache,
    validator,
    globMatcher,
    subdirLoader,
    conditionalRules,
    files,
    dirs,
    links,
    errors,
    events,
    logs,
    hooks,
    add,
    get cwd() {
      return cwd;
    },
    set cwd(value) {
      cwd = value;
    },
    home,
  };
}

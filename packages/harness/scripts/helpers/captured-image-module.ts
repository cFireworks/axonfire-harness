import { parse } from "acorn";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { createContext, runInContext } from "node:vm";

/** Execute only the fixed image module graph, never the application's entry point. */
export function loadCapturedImageModule(
  source: string,
  env: NodeJS.ProcessEnv = {},
) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  let modules: any;
  function visit(n: any) {
    if (!n || typeof n !== "object") return;
    if (
      n.type === "ObjectExpression" &&
      n.properties?.some(
        (p: any) => p.key?.value === 84024 && p.start === 13108540,
      )
    )
      modules = n;
    for (const [k, v] of Object.entries(n))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(visit);
        else if (v && typeof v === "object") visit(v);
      }
  }
  visit(parse(source, { ecmaVersion: "latest" }));
  if (!modules) throw Error("image module map");
  const entries = new Map<number, any>(
      modules.properties.map((p: any) => [p.key.value, p]),
    ),
    cache = new Map<number, any>(),
    require = createRequire(import.meta.url),
    events: any[] = [];
  const blocked =
    (name: string) =>
    (..._args: any[]) => {
      throw Error("Captured codec external I/O blocked: " + name);
    };
  const fs = new Proxy(
    {
      constants: {},
      promises: new Proxy(
        {},
        { get: (_t, key) => blocked("fs.promises." + String(key)) },
      ),
    },
    {
      get: (target: any, key) =>
        key in target ? target[key] : blocked("fs." + String(key)),
    },
  );
  const builtins = new Set([
    "buffer",
    "util",
    "stream",
    "events",
    "zlib",
    "assert",
    "string_decoder",
    "constants",
    "path",
    "url",
    "os",
    "crypto",
    "tty",
    "querystring",
  ]);
  const processView = {
    env,
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    versions: process.versions,
    nextTick: process.nextTick.bind(process),
    cwd: () => "/owned",
    browser: false,
  };
  const sandbox: any = {
    Buffer,
    Uint8Array,
    ArrayBuffer,
    TextEncoder,
    TextDecoder,
    URL,
    URLSearchParams,
    Error,
    TypeError,
    SyntaxError,
    JSON,
    Promise,
    process: processView,
    __dirname: "/owned",
    __filename: "/owned/captured-image.js",
    setTimeout,
    clearTimeout,
    setImmediate,
    clearImmediate,
    console: {
      log: (...a: any[]) => events.push(["log", ...a]),
      warn: (...a: any[]) => events.push(["warn", ...a]),
      error: (...a: any[]) => events.push(["error", ...a]),
    },
    require(name: string) {
      if (name === "fs") return fs;
      if (name === "fs/promises") return fs.promises;
      if (builtins.has(name)) return require("node:" + name);
      throw Error("Captured codec external module blocked: " + name);
    },
  };
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  const context = createContext(sandbox),
    logger = { warn: (...args: any[]) => events.push(["warn", ...args]) };
  function load(id: number): any {
    if (id === 80699)
      return { ContainerUtil: { get: () => logger }, Logger: Symbol("Logger") };
    if (id === 70867) return blocked("network");
    if (id === 96161) return blocked("font/fileloader");
    if (cache.has(id)) return cache.get(id).exports;
    const n = entries.get(id);
    if (!n) throw Error("Unmapped captured module " + id);
    const module = { exports: {}, paths: [], children: [] };
    cache.set(id, module);
    let code = source.slice(n.start, n.end);
    if (id === 84024) code = code.slice(0, -1) + ";el.__codec=tF;}";
    const fn = runInContext("({" + code + "})[" + id + "]", context, {
      timeout: 1000,
    });
    fn.call(module.exports, module, module.exports, load);
    return module.exports;
  }
  load.r = (out: any) =>
    Object.defineProperty(out, "__esModule", { value: true });
  load.d = (out: any, entries: any) => {
    for (const [key, get] of Object.entries(entries))
      if (!Object.hasOwn(out, key))
        Object.defineProperty(out, key, { get: get as any, enumerable: true });
  };
  load.n = (out: any) => {
    const getter = out?.__esModule ? () => out.default : () => out;
    Object.defineProperty(getter, "a", { get: getter });
    return getter;
  };
  load.o = (out: any, key: any) => Object.hasOwn(out, key);
  load.g = sandbox;
  load.nmd = (module: any) => module;
  const result = load(84024);
  return {
    ImageUtils: result.ImageUtils,
    codec: result.__codec,
    events,
    loadedModules: [...cache.keys()],
  };
}

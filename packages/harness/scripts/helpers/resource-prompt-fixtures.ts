import * as fs from "node:fs";
import * as path from "node:path";
import { EventEmitter } from "node:events";
import { promisify } from "node:util";
import { createNativeResourcePrompt } from "../../src/prompts/native-resource-prompt.js";
import { desktopTemplateDirectory } from "../../src/prompts/desktop-template-assets.js";
export async function resourcePromptFixture(
  root: string,
  factory = createNativeResourcePrompt,
  spec: any = {},
) {
  const calls: any[] = [],
    timers = new Map<any, { callback: any; at: number }>(),
    jobs = new Set<Promise<any>>();
  let now = Date.parse("2026-10-20T00:00:00Z"),
    account = spec.account,
    token = spec.token,
    response = spec.response ?? {
      code: 0,
      data: { foryou_prompt: "owned cloud profile" },
    };
  const env: any = { ...spec.env },
    home = path.join(root, "home"),
    cwd = path.join(root, "project"),
    configDir = path.join(home, ".workbuddy"),
    userDataDir = path.join(configDir, "app");
  await fs.promises.mkdir(cwd, { recursive: true });
  await fs.promises.mkdir(userDataDir, { recursive: true });
  if (spec.appConfig)
    await fs.promises.writeFile(
      path.join(userDataDir, "app-config.json"),
      JSON.stringify(spec.appConfig),
    );
  const product = spec.product ?? {
    productName: "Owned Buddy",
    dataFolderName: ".owned",
    models: [{ id: "owned-id", name: "Owned Model" }],
    endpoint: "http://owned.invalid",
  };
  const logger = Object.fromEntries(
    ["info", "warn", "error", "debug"].map((key) => [
      key,
      (...args: any[]) => calls.push([key, ...args]),
    ]),
  );
  function own(native: any) {
    return (...args: any[]) => {
      const job = native(...args);
      jobs.add(job);
      void job.then(
        () => jobs.delete(job),
        () => jobs.delete(job),
      );
      return job;
    };
  }
  const execFile: any = () => {
    throw Error("fixture execFile callback path not expected");
  };
  execFile[promisify.custom] = async (...args: any[]) => {
    calls.push(["git", ...args]);
    return { stdout: spec.git ? "true\n" : "false\n", stderr: "" };
  };
  const protocol = {
    request(url: URL, configuration: any, listener: any) {
      calls.push(["request", url.href, configuration]);
      const req: any = new EventEmitter();
      req.end = () =>
        queueMicrotask(() => {
          if (spec.holdRequest) return;
          if (spec.networkError) {
            req.emit(
              "error",
              Object.assign(Error("owned network"), { code: "OWNED" }),
            );
            return;
          }
          const res: any = new EventEmitter();
          res.statusCode = spec.status ?? 200;
          res.resume = () => calls.push(["resume"]);
          listener(res);
          if (res.statusCode === 200) {
            res.emit(
              "data",
              typeof response === "string"
                ? response
                : JSON.stringify(response),
            );
            res.emit("end");
          }
        });
      req.destroy = () =>
        queueMicrotask(() =>
          req.emit("error", Error("owned request destroyed")),
        );
      return req;
    },
  };
  class Clock extends Date {
    constructor(...args: any[]) {
      super(args.length ? args[0] : now);
    }
    static now() {
      return now;
    }
  }
  const native = factory({
    getWorkDir: () => cwd,
    env,
    fs,
    http: protocol,
    https: protocol,
    Date: Clock,
    Math: {
      ...Math,
      random: () => 0.25,
      floor: Math.floor,
      max: Math.max,
      min: Math.min,
    },
    crypto: { randomBytes: () => Buffer.from("00000000", "hex") },
    os: {
      homedir: () => home,
      platform: () => spec.platform ?? "darwin",
      version: () => "Owned OS",
    },
    childProcess: { execFile },
    ownAsync: own,
    contextOptions: {
      configDir,
      userDataDir,
      promptTemplatesDir: spec.templatesDir ?? desktopTemplateDirectory(),
      locale: spec.locale ?? "en-US",
    },
    ...(spec.nunjucks ? { nunjucks: spec.nunjucks } : {}),
    console: logger,
    setTimeout(callback: any, ms: number) {
      const handle = { unref() {} };
      timers.set(handle, { callback, at: now + ms });
      return handle;
    },
    clearTimeout(handle: any) {
      timers.delete(handle);
    },
    ...(spec.binaryTypes
      ? { getRegisteredBinaryTypes: () => spec.binaryTypes }
      : {}),
  });
  const service = Object.assign(new native.WorkbuddySystemPromptService(), {
    logger,
    productManager: {
      async waitConfiguration() {
        if (spec.productError) throw Error("owned product");
        return product;
      },
      getEndpoint: () => product.endpoint,
    },
    authService: { getAccount: () => account, getToken: () => token },
    authenticationManager: spec.authentication ?? {},
    ...(spec.binary
      ? {
          binaryManager: {
            async generatePromptContext(disabled?: string[]) {
              calls.push(["binary", disabled]);
              if (spec.binaryError) throw Error("owned binary");
              return spec.binary;
            },
          },
        }
      : {}),
  });
  async function drain() {
    await new Promise<void>((r) => setImmediate(r));
    while (jobs.size) await Promise.allSettled([...jobs]);
  }
  return {
    native,
    service,
    env,
    calls,
    root,
    home,
    cwd,
    configDir,
    userDataDir,
    product,
    logger,
    timers,
    async put(relative: string, value: any) {
      const target = path.join(root, relative);
      await fs.promises.mkdir(path.dirname(target), { recursive: true });
      await fs.promises.writeFile(
        target,
        typeof value === "string" ? value : JSON.stringify(value),
      );
    },
    setAccount(value: any) {
      account = value;
    },
    setToken(value: any) {
      token = value;
    },
    setResponse(value: any) {
      response = value;
    },
    advance(ms: number) {
      now += ms;
      for (const [handle, timer] of timers)
        if (timer.at <= now) {
          timers.delete(handle);
          timer.callback();
        }
    },
    drain,
    snapshot(value: any) {
      return JSON.parse(
        JSON.stringify({
          value,
          calls,
          cache: [...native.resolutionCache].map(([key, value]: any) => [
            key,
            { expiresAt: value.expiresAt },
          ]),
          cooldown: [...native.remoteFallbackCooldowns].map(
            ([key, value]: any) => [key, { expiresAt: value.expiresAt }],
          ),
        }).replaceAll(root, "/owned"),
      );
    },
    async dispose() {
      await drain();
      timers.clear();
    },
  };
}

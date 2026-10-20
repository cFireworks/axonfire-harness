import * as http from "node:http";
import * as https from "node:https";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
/** Standalone I/O ownership, not original execa/fs-extra or product authentication. */
export function createOwnedMarketplaceIO(stateDir: string, fsExtra: any) {
  let closed = false;
  let closing: Promise<void> | undefined;
  const requests = new Set<any>(),
    responses = new Set<any>(),
    streams = new Set<any>(),
    archives = new Set<any>(),
    children = new Set<any>(),
    controllers = new Set<AbortController>(),
    pending = new Set<Promise<any>>();
  const httpAgent = new http.Agent({ keepAlive: false }),
    httpsAgent = new https.Agent({ keepAlive: false });
  const unavailable = () => {
    throw Error("Marketplace I/O is closed");
  };
  function observe<T>(p: Promise<T>): Promise<T> {
    pending.add(p);
    void p.then(
      () => pending.delete(p),
      () => pending.delete(p),
    );
    return p;
  }
  function ownStream(stream: any) {
    streams.add(stream);
    stream.on("error", () => {});
    stream.once("close", () => streams.delete(stream));
    // yauzl entry streams can finish without emitting close; their read ref is released on end.
    stream.once("end", () => streams.delete(stream));
    return stream;
  }
  function protocol(base: any, agent: any) {
    function request(...args: any[]) {
      if (closed) return unavailable();
      const callback =
        typeof args.at(-1) === "function" ? args.pop() : undefined;
      const req =
        typeof args[0] === "string" || args[0] instanceof URL
          ? base.request(args[0], { ...(args[1] ?? {}), agent })
          : base.request({ ...args[0], agent });
      requests.add(req);
      req.on("error", () => {});
      req.once("close", () => requests.delete(req));
      req.on("response", (response: any) => {
        responses.add(response);
        response.once("close", () => responses.delete(response));
        response.on("error", (error: any) => {
          if (!closed) req.emit("error", error);
        });
        // Original callers discard non-200/redirect bodies. Drain only owned unused bodies.
        if (response.statusCode !== 200 || req.method === "HEAD")
          response.resume();
        callback?.(response);
      });
      return req;
    }
    return {
      request,
      get(...args: any[]) {
        const req = request(...args);
        req.end();
        return req;
      },
    };
  }
  const ownedHttp = protocol(http, httpAgent),
    ownedHttps = protocol(https, httpsAgent);
  async function ownedFetch(url: any, init: any = {}) {
    if (closed) return unavailable();
    const controller = new AbortController();
    controllers.add(controller);
    try {
      const response = await observe(
        fetch(url, {
          ...init,
          signal: init.signal
            ? AbortSignal.any([init.signal, controller.signal])
            : controller.signal,
        }),
      );
      if (!response.ok) {
        await response.body?.cancel();
        controllers.delete(controller);
      }
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        json: () =>
          observe(
            response.json().finally(() => controllers.delete(controller)),
          ),
      };
    } catch (error) {
      controllers.delete(controller);
      throw error;
    }
  }
  const rawYauzl: any = createRequire(import.meta.url)("yauzl");
  const yauzl = {
    open(file: any, options: any, callback: any) {
      if (closed) {
        queueMicrotask(() => callback(Error("Marketplace I/O is closed")));
        return;
      }
      let finished!: () => void;
      observe(
        new Promise<void>((resolve) => {
          finished = resolve;
        }),
      );
      rawYauzl.open(file, options, (error: any, archive: any) => {
        if (error || !archive) {
          callback(error, archive);
          finished();
          return;
        }
        archives.add(archive);
        archive.on("error", () => {});
        archive.once("close", () => archives.delete(archive));
        if (closed) {
          archive.once("close", finished);
          archive.close();
          callback(Error("Marketplace I/O is closed"));
          return;
        }
        const native = archive.openReadStream.bind(archive);
        archive.openReadStream = (entry: any, cb: any) =>
          native(entry, (err: any, stream: any) =>
            cb(err, stream ? ownStream(stream) : stream),
          );
        callback(error, archive);
        finished();
      });
    },
  };
  function exec(command: string, args: string[], options: any = {}) {
    if (closed) return Promise.reject(Error("Marketplace I/O is closed"));
    return observe(
      (async () => {
        if (command !== "git")
          throw Error("Only git is supported by marketplace process adapter");
        const operation = args[0];
        if (
          ![
            "--version",
            "rev-parse",
            "clone",
            "fetch",
            "reset",
            "clean",
          ].includes(operation ?? "")
        )
          throw Error("Unsupported marketplace git operation");
        if (operation === "clone") fsExtra.assertWritePath(args.at(-1));
        else if (operation !== "--version")
          fsExtra.assertWritePath(options.cwd);
        const home = path.join(stateDir, "marketplace-git-home");
        await fsExtra.ensureDir(home);
        await fsExtra.ensureDir(path.join(stateDir, "tmp"));
        if (closed) return unavailable();
        return new Promise<any>((resolve, reject) => {
          const child = spawn(command, args, {
            cwd: options.cwd,
            env: {
              PATH: process.env.PATH ?? "",
              HOME: home,
              USERPROFILE: home,
              XDG_CONFIG_HOME: home,
              TMPDIR: path.join(stateDir, "tmp"),
              ...options.env,
              GIT_CONFIG_NOSYSTEM: "1",
              GIT_CONFIG_GLOBAL: path.join(home, "config"),
              GIT_TERMINAL_PROMPT: "0",
              GIT_ASKPASS: "",
              SSH_ASKPASS: "",
              GIT_CONFIG_COUNT: "0",
              // No installed SSH agent, identities, config or known-host mutation. Inject exec for authenticated SSH.
              GIT_SSH_COMMAND:
                "ssh -F /dev/null -o BatchMode=yes -o IdentitiesOnly=yes -o IdentityAgent=none -o IdentityFile=none -o StrictHostKeyChecking=yes -o UserKnownHostsFile=/dev/null -o GlobalKnownHostsFile=/dev/null",
            },
            stdio: ["ignore", "pipe", "pipe"],
            shell: false,
          });
          children.add(child);
          let stdout = "",
            stderr = "";
          child.stdout.on("data", (data) => {
            stdout += data;
          });
          child.stderr.on("data", (data) => {
            stderr += data;
          });
          const timeout = options.timeout
            ? setTimeout(() => child.kill("SIGTERM"), options.timeout)
            : undefined;
          child.once("error", reject);
          child.once("close", (code, signal) => {
            children.delete(child);
            if (timeout) clearTimeout(timeout);
            if (code === 0) resolve({ stdout, stderr, exitCode: 0 });
            else
              reject(
                Object.assign(
                  Error(
                    `git ${operation} failed (${code ?? signal}): ${stderr.trim()}`,
                  ),
                  { stdout, stderr, exitCode: code, signal },
                ),
              );
          });
        });
      })(),
    );
  }
  return {
    http: ownedHttp,
    https: ownedHttps,
    fetch: ownedFetch,
    exec,
    yauzl,
    streamFs: {
      createReadStream: (...args: any[]) =>
        ownStream(fsExtra.createReadStream(...args)),
      createWriteStream: (...args: any[]) =>
        ownStream(fsExtra.createWriteStream(...args)),
    },
    close() {
      return (closing ??= (async () => {
        closed = true;
        const error = Error("Marketplace I/O is closed");
        const resources = [
          ...requests,
          ...responses,
          ...archives,
          ...streams,
          ...children,
        ];
        const drained = resources.map(
          (resource) =>
            new Promise<void>((resolve) =>
              resource.once("close", () => resolve()),
            ),
        );
        for (const c of controllers) c.abort(error);
        controllers.clear();
        for (const req of requests) req.destroy(error);
        for (const response of responses) response.destroy();
        for (const archive of archives) {
          archive.emit("error", error);
          archive.close();
        }
        for (const stream of streams) stream.destroy(error);
        for (const child of children) {
          child.kill("SIGTERM");
          const escalation = setTimeout(() => {
            if (children.has(child)) child.kill("SIGKILL");
          }, 1000);
          child.once("close", () => clearTimeout(escalation));
        }
        httpAgent.destroy();
        httpsAgent.destroy();
        while (pending.size) await Promise.allSettled([...pending]);
        await Promise.all(drained);
      })());
    },
    get ownedHandleCount() {
      return (
        requests.size +
        responses.size +
        streams.size +
        archives.size +
        children.size +
        controllers.size
      );
    },
  };
}

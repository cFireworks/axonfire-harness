import * as http from "node:http";
import * as https from "node:https";
/** Explicit single-origin JSON GET transport, not recovered CellJS REST/auth middleware. */
export type OwnedCloudProductHttpOptions = {
  baseURL: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (handle: any) => void;
};
export function createOwnedCloudProductHttp(
  options: OwnedCloudProductHttpOptions,
) {
  const base = new URL(options.baseURL);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password
  )
    throw Error(
      "Cloud product requires an explicit HTTP(S) origin without URL credentials",
    );
  let closed = false,
    closing: Promise<void> | undefined;
  const pending = new Set<Promise<any>>(),
    requests = new Set<http.ClientRequest>(),
    responses = new Set<http.IncomingMessage>(),
    timers = new Set<any>();
  const agents = {
      http: new http.Agent({ keepAlive: false }),
      https: new https.Agent({ keepAlive: false }),
    },
    schedule = options.setTimeout ?? setTimeout,
    cancel = options.clearTimeout ?? clearTimeout;
  async function run(url: string, config: any) {
    if (closed) throw Error("Cloud product HTTP is closed");
    const endpoint = config.baseURL || base.href;
    const target = /^https?:\/\//i.test(url)
      ? new URL(url)
      : url.startsWith("//")
        ? new URL(base.protocol + url)
        : new URL(endpoint.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, ""));
    if (target.origin !== base.origin || target.username || target.password)
      throw Error("Cloud product request is outside explicit origin");
    for (const [key, value] of Object.entries(config.params ?? {}))
      for (const item of Array.isArray(value) ? value : [value])
        if (item !== undefined && item !== null)
          target.searchParams.append(
            Array.isArray(value) ? key + "[]" : key,
            String(item),
          );
    const headers = {
      ...(typeof options.headers === "function"
        ? options.headers()
        : options.headers),
      ...config.headers,
    };
    const timeout = config.timeout ?? 5000;
    if (!Number.isFinite(timeout) || timeout <= 0)
      throw Error("Cloud product request timeout must be positive");
    config.signal?.throwIfAborted();
    return new Promise<any>((resolve, reject) => {
      let response: http.IncomingMessage | undefined,
        settled = false,
        timer: { handle: any; active: boolean } | undefined;
      const request = (target.protocol === "https:" ? https : http).request(
        target,
        {
          method: "GET",
          headers,
          agent: target.protocol === "https:" ? agents.https : agents.http,
        },
      );
      requests.add(request);
      request.once("close", () => requests.delete(request));
      const finish = (error: any, value?: any) => {
        if (settled) return;
        settled = true;
        if (timer?.active) {
          timer.active = false;
          cancel(timer.handle);
          timers.delete(timer);
        }
        config.signal?.removeEventListener("abort", abort);
        error ? reject(error) : resolve(value);
      };
      const fail = (error: any) => {
        finish(error);
        response?.destroy();
        request.destroy(error instanceof Error ? error : Error(String(error)));
      };
      const abort = () =>
        fail(config.signal.reason ?? Error("Cloud product request aborted"));
      request.on("error", (error) => finish(error));
      request.on("response", (res) => {
        response = res;
        responses.add(res);
        res.once("close", () => responses.delete(res));
        res.on("error", (error) => finish(error));
        if (closed) {
          fail(Error("Cloud product HTTP is closed"));
          return;
        }
        if ((res.statusCode ?? 0) < 200 || (res.statusCode ?? 0) >= 300) {
          fail(
            Object.assign(Error("Cloud product HTTP " + res.statusCode), {
              response: { status: res.statusCode },
              config: { url },
            }),
          );
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.once("aborted", () =>
          finish(Error("Cloud product response aborted")),
        );
        res.once("end", () => {
          try {
            finish(undefined, {
              data: JSON.parse(Buffer.concat(chunks).toString("utf8")),
              status: res.statusCode,
              headers: res.headers,
            });
          } catch (error) {
            finish(error);
          }
        });
      });
      config.signal?.addEventListener("abort", abort, { once: true });
      timer = { handle: undefined, active: true };
      timers.add(timer);
      try {
        timer.handle = schedule(
          () =>
            fail(
              Object.assign(Error("Cloud product request timed out"), {
                code: "ETIMEDOUT",
                config: { url },
              }),
            ),
          timeout,
        );
      } catch (error) {
        fail(error);
        return;
      }
      request.end();
    });
  }
  return {
    get(url: string, config: any = {}) {
      const job = run(url, config);
      pending.add(job);
      void job.then(
        () => pending.delete(job),
        () => pending.delete(job),
      );
      return job;
    },
    close() {
      return (closing ??= (async () => {
        closed = true;
        for (const timer of timers) {
          timer.active = false;
          cancel(timer.handle);
        }
        timers.clear();
        const ended = [...requests, ...responses]
          .filter((resource) => !resource.closed)
          .map(
            (resource) =>
              new Promise<void>((resolve) => resource.once("close", resolve)),
          );
        for (const req of requests)
          req.destroy(Error("Cloud product HTTP is closed"));
        for (const res of responses) res.destroy();
        agents.http.destroy();
        agents.https.destroy();
        while (pending.size) await Promise.allSettled([...pending]);
        await Promise.allSettled(ended);
      })());
    },
    get pendingCount() {
      return pending.size;
    },
    get ownedHandleCount() {
      return requests.size + responses.size + timers.size;
    },
  };
}

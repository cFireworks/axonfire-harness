// New local-only host adapter. The recovered runtime remains in packages/harness.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createHarness } from "@axonfire/harness";

const assets = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
]);
const validId = (id) =>
  typeof id === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(id);
const textContent = (item) =>
  typeof item.content === "string"
    ? item.content
    : Array.isArray(item.content)
      ? item.content.map((part) => part.text ?? "").join("\n")
      : "";

async function jsonBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 65_536)
      throw Object.assign(new Error("Request too large"), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }
}

export async function createWebHost(options) {
  const csrf = randomUUID();
  let runtime,
    runtimePromise,
    active,
    closing = false;
  const pending = new Map();
  const json = (res, status, body) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify(body));
  };
  const event = (res, type, data) => {
    if (!res.destroyed && !res.writableEnded)
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  function requestDecision(type, data, signal) {
    if (!active || signal.aborted) return Promise.resolve(undefined);
    const id = randomUUID();
    return new Promise((resolve) => {
      const finish = (value) => {
        clearTimeout(timer);
        signal.removeEventListener("abort", abort);
        pending.delete(id);
        resolve(value);
      };
      const abort = () => finish(undefined);
      const timer = setTimeout(abort, 120_000);
      signal.addEventListener("abort", abort, { once: true });
      pending.set(id, { type, finish });
      event(active.response, type, { id, ...data });
    });
  }
  async function getRuntime() {
    runtimePromise ??= (options.createRuntime ?? createHarness)({
      ...options.harness,
      approveTool: async (name, input, session) =>
        (await requestDecision(
          "approval",
          { name, input },
          session.abortSignal,
        )) === true,
      askUserQuestion: (input, session) =>
        requestDecision("question", { input }, session.abortSignal),
    });
    try {
      runtime = await runtimePromise;
      return runtime;
    } catch (error) {
      runtimePromise = undefined;
      throw error;
    }
  }
  const server = createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
    const address = server.address();
    const host = `127.0.0.1:${address.port}`;
    // Fixed loopback binding + Host and Origin validation prevent DNS rebinding / CSRF.
    if (
      closing ||
      req.headers.host !== host ||
      (req.headers.origin && req.headers.origin !== `http://${host}`)
    ) {
      json(res, 403, { error: "Local origin required" });
      return;
    }
    try {
      const url = new URL(req.url, `http://${host}`);
      if (req.method === "GET" && assets.has(url.pathname)) {
        const [file, contentType] = assets.get(url.pathname);
        res.setHeader("Content-Type", contentType);
        res.end(await readFile(new URL(`./public/${file}`, import.meta.url)));
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/status") {
        json(res, 200, {
          name: "axonfire-harness",
          mode: options.demo ? "demo" : "live",
          configured: options.configured,
          model: options.model ?? "product default",
          csrf,
          busy: Boolean(active),
        });
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/sessions") {
        if (!options.configured) {
          json(res, 200, []);
          return;
        }
        if (active) {
          json(res, 409, { error: "A turn is running" });
          return;
        }
        const core = await getRuntime();
        json(
          res,
          200,
          (await core.store.getAll()).map((session) => ({
            id: session.id,
            updatedAt: session.updatedAt,
          })),
        );
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/history") {
        const id = url.searchParams.get("id");
        if (!validId(id)) {
          json(res, 400, { error: "Invalid session id" });
          return;
        }
        if (active) {
          json(res, 409, { error: "A turn is running" });
          return;
        }
        if (!options.configured) {
          json(res, 503, { error: "Configure model first" });
          return;
        }
        const session = await (await getRuntime()).store.get(id);
        if (!session) {
          json(res, 404, { error: "Session not found" });
          return;
        }
        json(
          res,
          200,
          session.history
            .filter((item) => item.type === "message")
            .map((item) => ({ role: item.role, text: textContent(item) })),
        );
        return;
      }
      if (
        req.method !== "POST" ||
        req.headers.origin !== `http://${host}` ||
        req.headers["x-axonfire-csrf"] !== csrf
      ) {
        json(res, 403, { error: "Same-origin request token required" });
        return;
      }
      const body = await jsonBody(req);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        json(res, 400, { error: "Object required" });
        return;
      }
      if (url.pathname === "/api/approve" || url.pathname === "/api/answer") {
        const decision = pending.get(body.id);
        const type = url.pathname === "/api/approve" ? "approval" : "question";
        if (!decision || decision.type !== type) {
          json(res, 404, { error: "Decision expired" });
          return;
        }
        if (type === "approval" && typeof body.allow !== "boolean") {
          json(res, 400, { error: "Boolean approval required" });
          return;
        }
        if (
          type === "question" &&
          (!body.answers ||
            typeof body.answers !== "object" ||
            Array.isArray(body.answers) ||
            Object.values(body.answers).some(
              (value) => typeof value !== "string",
            ))
        ) {
          json(res, 400, { error: "String answers required" });
          return;
        }
        decision.finish(type === "approval" ? body.allow : body.answers);
        json(res, 200, { ok: true });
        return;
      }
      if (url.pathname === "/api/cancel") {
        active?.controller.abort();
        json(res, 200, { ok: true });
        return;
      }
      if (url.pathname !== "/api/prompt" && url.pathname !== "/api/compact") {
        json(res, 404, { error: "Not found" });
        return;
      }
      if (!options.configured) {
        json(res, 503, {
          error:
            "Set API key, base URL and model in .env; restart the server, or use npm run demo.",
        });
        return;
      }
      if (body.sessionId !== undefined && !validId(body.sessionId)) {
        json(res, 400, { error: "Invalid session id" });
        return;
      }
      if (url.pathname === "/api/compact" && !body.sessionId) {
        json(res, 400, { error: "Session required" });
        return;
      }
      if (
        url.pathname === "/api/prompt" &&
        (typeof body.prompt !== "string" ||
          !body.prompt.trim() ||
          body.prompt.length > 32_000)
      ) {
        json(res, 400, { error: "Prompt must contain 1–32000 characters" });
        return;
      }
      if (active) {
        json(res, 409, { error: "A turn is already running" });
        return;
      }
      const controller = new AbortController();
      active = { controller, response: res };
      const disconnected = () => controller.abort();
      res.on("close", disconnected);
      const heartbeat = setInterval(() => {
        if (!res.destroyed) res.write(": keepalive\n\n");
      }, 15_000);
      try {
        res.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "X-Accel-Buffering": "no",
        });
        res.flushHeaders();
        const core = await getRuntime();
        if (body.sessionId && !(await core.store.get(body.sessionId)))
          throw new Error("Unknown session");
        const session = await core.openSession(body.sessionId);
        event(res, "session", { id: session.id });
        controller.signal.throwIfAborted();
        if (url.pathname === "/api/compact") {
          await core.compact(session);
          event(res, "done", { text: "Context compacted", compacted: true });
        } else {
          let streamed = false;
          const result = await core.prompt(session, body.prompt, {
            signal: controller.signal,
            onText(text) {
              streamed = true;
              event(res, "delta", { text });
            },
          });
          event(res, "done", { text: result ?? "", streamed });
        }
      } catch {
        // Do not serialize upstream errors: some transports include headers / credentials.
        event(res, "error", {
          error: controller.signal.aborted
            ? "Turn cancelled"
            : "Turn failed. Check model configuration and endpoint compatibility.",
        });
      } finally {
        clearInterval(heartbeat);
        for (const decision of [...pending.values()])
          decision.finish(undefined);
        active = undefined;
        res.removeListener("close", disconnected);
        res.end();
      }
    } catch (error) {
      if (!res.headersSent)
        json(res, error.status ?? 500, {
          error: error.status ? error.message : "Local host operation failed",
        });
      else res.end();
    }
  });
  return {
    server,
    async listen(port = 3080) {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", resolve);
      });
      return `http://127.0.0.1:${server.address().port}`;
    },
    async close() {
      closing = true;
      active?.controller.abort();
      for (const decision of [...pending.values()]) decision.finish(undefined);
      const closed = new Promise((resolve) => server.close(resolve));
      server.closeIdleConnections();
      await runtimePromise?.then(
        (core) => core.close(),
        () => undefined,
      );
      server.closeAllConnections();
      await closed;
    },
  };
}

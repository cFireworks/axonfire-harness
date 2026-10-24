import assert from "node:assert/strict";
import * as http from "node:http";
import * as https from "node:https";
import { key, cert } from "./proxy-tls-fixture.js";
import * as net from "node:net";
import { once } from "node:events";
import { createRequire } from "node:module";
import { PassThrough } from "node:stream";
import { createNativeHttpsProxyAgent } from "../../src/runtime/native-https-proxy-agent.js";
const require = createRequire(import.meta.url);
type Factory = typeof createNativeHttpsProxyAgent;
function native(factory: Factory) {
  return factory({ require, globals: globalThis, process, console });
}
export const HTTPS_PROXY_AGENT_CASES = [
  {
    name: "original proxy agent negotiates TLS to both proxy and destination",
    async run(factory: Factory) {
      const n = native(factory),
        sockets = new Set<net.Socket>();
      const track = (s: net.Socket) => {
        sockets.add(s);
        s.on("close", () => sockets.delete(s));
        return s;
      };
      const target = https.createServer({ key, cert }, (_req, res) =>
        res.end("secure tunnel"),
      );
      const proxy = https.createServer({ key, cert });
      for (const server of [target, proxy]) server.on("connection", track);
      let connects = 0,
        agent: any;
      proxy.on("connect", (_req, client, head) => {
        connects++;
        const upstream = track(
          net.connect(
            (target.address() as net.AddressInfo).port,
            "127.0.0.1",
            () => {
              client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
              if (head.length) upstream.write(head);
              client.pipe(upstream).pipe(client);
            },
          ),
        );
        upstream.on("error", () => client.destroy());
        client.on("error", () => upstream.destroy());
      });
      try {
        target.listen(0, "127.0.0.1");
        await once(target, "listening");
        proxy.listen(0, "127.0.0.1");
        await once(proxy, "listening");
        agent = new n.HttpsProxyAgent(
          `https://127.0.0.1:${(proxy.address() as net.AddressInfo).port}`,
          { rejectUnauthorized: false },
        );
        const result = await new Promise<any>((resolve, reject) => {
          https
            .get(
              `https://localhost:${(target.address() as net.AddressInfo).port}/`,
              { agent, rejectUnauthorized: false },
              (res) => {
                let body = "";
                const encrypted = (res.socket as any).encrypted;
                res.on("data", (c) => (body += c));
                res.on("error", reject);
                res.on("end", () => resolve({ body, encrypted }));
              },
            )
            .on("error", reject);
        });
        assert.deepEqual(result, { body: "secure tunnel", encrypted: true });
        assert.equal(connects, 1);
        return result;
      } finally {
        agent?.destroy();
        for (const s of sockets) s.destroy();
        await Promise.all(
          [target, proxy].map(
            (s) => new Promise<void>((r) => s.close(() => r())),
          ),
        );
      }
    },
  },

  {
    name: "original proxy agent tunnels loopback HTTP via CONNECT with credentials and headers",
    async run(factory: Factory) {
      const n = native(factory),
        requests: any[] = [],
        sockets = new Set<net.Socket>();
      const track = (socket: net.Socket) => {
        sockets.add(socket);
        socket.on("close", () => sockets.delete(socket));
        return socket;
      };
      const target = http.createServer((req, res) =>
        res.end("tunnel:" + req.url),
      );
      target.on("connection", track);
      const proxy = http.createServer();
      proxy.on("connection", track);
      proxy.on("connect", (req, client, head) => {
        requests.push({
          method: req.method,
          authorization: req.headers["proxy-authorization"],
          custom: req.headers["x-owned"],
        });
        const upstream = track(
          net.connect(
            (target.address() as net.AddressInfo).port,
            "127.0.0.1",
            () => {
              client.write(
                "HTTP/1.1 200 Connection established\r\nX-Proxy: owned\r\n\r\n",
              );
              if (head.length) upstream.write(head);
              client.pipe(upstream).pipe(client);
            },
          ),
        );
        upstream.on("error", () => client.destroy());
        client.on("error", () => upstream.destroy());
      });
      let agent: any;
      try {
        target.listen(0, "127.0.0.1");
        await once(target, "listening");
        proxy.listen(0, "127.0.0.1");
        await once(proxy, "listening");
        agent = new n.HttpsProxyAgent(
          `http://user:p%40ss@127.0.0.1:${(proxy.address() as net.AddressInfo).port}`,
          { headers: { "X-Owned": "yes" }, maxSockets: 1 },
        );
        const body = await new Promise<string>((resolve, reject) => {
          http
            .get(
              `http://127.0.0.1:${(target.address() as net.AddressInfo).port}/owned`,
              { agent },
              (res) => {
                let text = "";
                res.on("data", (c) => (text += c));
                res.on("end", () => resolve(text));
                res.on("error", reject);
              },
            )
            .on("error", reject);
        });
        assert.equal(body, "tunnel:/owned");
        assert.deepEqual(requests, [
          {
            method: "CONNECT",
            authorization:
              "Basic " + Buffer.from("user:p@ss").toString("base64"),
            custom: "yes",
          },
        ]);
        return { body, requests };
      } finally {
        agent?.destroy();
        for (const s of sockets) s.destroy();
        await Promise.all(
          [target, proxy].map(
            (s) => new Promise<void>((resolve) => s.close(() => resolve())),
          ),
        );
      }
    },
  },
  {
    name: "original proxy parser handles fragmented headers, duplicate fields and premature closure",
    async run(factory: Factory) {
      const parse = native(factory).getModule(36981).parseProxyResponse;
      const socket = new PassThrough();
      const parsed = parse(socket);
      socket.write(
        "HTTP/1.1 407 Proxy Authentication Required\r\nX-Owned: one\r\n",
      );
      socket.end("X-Owned: two\r\nContent-Length: 0\r\n\r\n");
      const result = await parsed;
      assert.deepEqual(result.connect, {
        statusCode: 407,
        statusText: "Proxy Authentication Required",
        headers: { "x-owned": ["one", "two"], "content-length": "0" },
      });
      const closed = new PassThrough();
      const rejected = parse(closed);
      closed.end("HTTP/1.1 200");
      await assert.rejects(rejected, /ended before receiving CONNECT response/);
      const bad = new PassThrough();
      const malformed = parse(bad);
      bad.end("HTTP/1.1 200 OK\r\nMissingColon\r\n\r\n");
      await assert.rejects(malformed, /Invalid header/);
      return result.connect;
    },
  },
];

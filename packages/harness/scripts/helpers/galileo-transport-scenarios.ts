import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import * as http from "node:http";
import * as https from "node:https";
import * as zlib from "node:zlib";
import { once } from "node:events";
import { createNativeGalileoTransport } from "../../src/runtime/native-galileo-transport.js";
const runtime = {
  crypto,
  http,
  https,
  zlib,
  sdk: { SDK_VERSION: "owned-test" },
};
export const GALILEO_TRANSPORT_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoTransport): Promise<any>;
}[] = [
  {
    name: "real HTTP transport preserves payload, gzip, response and retry status",
    async run(factory) {
      const received: any[] = [];
      let count = 0;
      const server = http.createServer(async (req, res) => {
        const parts = [];
        for await (const p of req) parts.push(p);
        const body = Buffer.concat(parts);
        received.push({
          method: req.method,
          path: req.url,
          encoding: req.headers["content-encoding"],
          length: req.headers["content-length"],
          body: (req.headers["content-encoding"] === "gzip"
            ? zlib.gunzipSync(body)
            : body
          ).toString(),
        });
        if (req.url === "/retry" && count++ === 0) {
          res.writeHead(503, { "Retry-After": "0" });
          res.end("retry");
        } else if (req.url === "/bad") {
          res.writeHead(400);
          res.end("owned rejection");
        } else res.end("owned reply");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const base = "http://127.0.0.1:" + (server.address() as any).port,
        n: any = factory(runtime),
        transports: any[] = [];
      try {
        const results = [];
        for (const [path, compression] of [
          ["/plain?q=1", "none"],
          ["/gzip", "gzip"],
          ["/retry", "none"],
          ["/bad", "none"],
        ]) {
          const t = new n.GalileoEncryptedOtlpHttpTransport(
            {
              url: base + path,
              compression,
              headers: () => ({ "Content-Type": "application/json" }),
              agentOptions: { keepAlive: true },
            },
            { enabled: false },
          );
          transports.push(t);
          const r = await t.send(Buffer.from('{"owned":"你好"}'), 2000);
          results.push({
            status: r.status,
            data: r.data?.toString(),
            error: r.error?.message,
          });
        }
        assert.deepEqual(
          results.map((r) => r.status),
          ["success", "success", "success", "failure"],
        );
        assert.equal(received.length, 5);
        assert.equal(received[1].encoding, "gzip");
        assert.equal(received[0].path, "/plain?q=1");
        assert.match(results[3]!.error!, /HTTP 400: owned rejection/);
        return { received, results };
      } finally {
        for (const t of transports) t.shutdown();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
  },
  {
    name: "encrypted payload uses original base62 AES framing and strips encoding headers",
    async run(factory) {
      const n: any = factory(runtime),
        key = "0123456789abcdef",
        out = [];
      for (const compression of ["none", "gzip"]) {
        const t = new n.GalileoEncryptedOtlpHttpTransport(
          {
            url: "http://owned.invalid/v1/traces",
            compression,
            headers: () => ({
              "Content-Encoding": "prior",
              "content-encoding": "prior2",
              Owned: "yes",
            }),
          },
          {
            endpointToKmsUrl: { "http://owned.invalid": "http://kms.invalid" },
          },
        );
        t.dekManagers.set("http://kms.invalid", {
          getDEK: async () => ({
            plaintext: key,
            ciphertext: "owned-key-token",
          }),
        });
        try {
          const payload = Buffer.from('{"test":"你好"}'),
            r = await t.prepareRequest(payload),
            dec = crypto.createDecipheriv(
              "aes-128-ecb",
              Buffer.from(key),
              null,
            ),
            plain = Buffer.concat([
              dec.update(Buffer.from(r.body.toString(), "base64")),
              dec.final(),
            ]).toString();
          assert.equal(
            plain,
            n.galileoBase62Encode(
              compression === "gzip"
                ? zlib.gzipSync(payload)
                : payload.toString(),
            ),
          );
          assert.equal(r.headers.Encrypted, "galileo-owned-key-token");
          assert.equal(r.headers["Content-Encoding"], undefined);
          assert.equal(r.headers["content-encoding"], undefined);
          out.push({ plain, headers: r.headers });
        } finally {
          t.shutdown();
        }
      }
      assert.equal(n.galileoBase62Encode("abc_123"), "abc_123");
      assert.throws(
        () => n.aesEcbPkcs5EncryptBase64("x", "bad"),
        /invalid AES key length/,
      );
      return out;
    },
  },
  {
    name: "DEK cache shares initial refresh and returns stale keys during background refresh",
    async run(factory) {
      let now = 10,
        calls = 0,
        resolve: any;
      const n: any = factory({ ...runtime, Date: { now: () => now } }),
        m: any = new n.DEKManager("owned", {
          refreshIntervalMillis: 20,
          retryIntervalMillis: 5,
        });
      m.refreshDEK = async () => {
        calls++;
        const result = await new Promise((r) => (resolve = r));
        m.dek = result;
        m.nextRefreshAt = now + 20;
        return result;
      };
      const a = m.getDEK(),
        b = m.getDEK();
      assert.equal(calls, 1);
      resolve({ plaintext: "owned", ciphertext: "first" });
      await Promise.all([a, b]);
      await m.getDEK();
      assert.equal(calls, 1);
      now = 31;
      const stale = await m.getDEK();
      assert.equal(stale.ciphertext, "first");
      assert.equal(calls, 2);
      resolve({ plaintext: "owned", ciphertext: "second" });
      await m.inFlight;
      assert.equal((await m.getDEK()).ciphertext, "second");
      const fail: any = new n.DEKManager("owned", {});
      fail.lastError = Error("cached");
      fail.nextRefreshAt = 40;
      await assert.rejects(fail.getDEK(), /cached/);
      return { calls, stale, key: m.dek };
    },
  },
  {
    name: "KMS JSON uses real HTTP and rejects non-2xx and invalid JSON responses",
    async run(factory) {
      const requests: any[] = [];
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        requests.push({
          path: req.url,
          method: req.method,
          body: JSON.parse(Buffer.concat(chunks).toString()),
        });
        if (req.url === "/bad") {
          res.writeHead(403);
          res.end("denied");
        } else if (req.url === "/json") res.end("broken");
        else res.end('{"owned":true}');
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const base = "http://127.0.0.1:" + (server.address() as any).port,
        n: any = factory(runtime);
      try {
        assert.deepEqual(
          await n.postJson(base + "/good", { owned: "request" }, 1000),
          { owned: true },
        );
        await assert.rejects(
          n.postJson(base + "/bad", {}, 1000),
          /KMS HTTP 403: denied/,
        );
        await assert.rejects(
          n.postJson(base + "/json", {}, 1000),
          /KMS returned invalid JSON/,
        );
        return requests;
      } finally {
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  },
  {
    name: "encryption routing and backoff retain exact original defaults",
    async run(factory) {
      const n: any = factory({
        ...runtime,
        Math: { ...Math, random: () => 0.5, max: Math.max, min: Math.min },
      });
      assert.equal(n.getNextBackoff(1000), 1000);
      assert.equal(n.getNextBackoff(9000), 5000);
      assert.equal(n.parseRetryAfterToMillis("0"), -1);
      assert.equal(n.parseRetryAfterToMillis(["2"]), 2000);
      assert.equal(n.isExportRetryable(500), false);
      assert.equal(n.isExportRetryable(503), true);
      const out = [];
      for (const url of [
        "https://galileotelemetry.tencent.com/v1/traces",
        "https://otlp.j.woa.com/v1/traces",
        "https://owned.invalid/v1/traces",
      ]) {
        const t = new n.GalileoEncryptedOtlpHttpTransport(
          { url, headers: () => ({}) },
          {},
        );
        try {
          out.push(t.getEncryptionInfo());
        } finally {
          t.shutdown();
        }
      }
      assert.equal(out[0].encrypt, true);
      assert.equal(out[1].encrypt, false);
      assert.equal(out[2].encrypt, false);
      return out;
    },
  },
];

GALILEO_TRANSPORT_CASES.push({
  name: "real loopback KMS RSA exchange encrypts and delivers payload with cached DEK",
  async run(factory) {
    const key = "0123456789abcdef",
      received: any[] = [];
    let keyRequests = 0;
    const server = http.createServer(async (req, res) => {
      try {
        const parts = [];
        for await (const p of req) parts.push(p);
        const body = Buffer.concat(parts);
        if (req.url === "/kms") {
          keyRequests++;
          const input = JSON.parse(body.toString()),
            publicKey = crypto.createPublicKey({
              key: Buffer.from(input.encryption_public_key, "base64"),
              type: "spki",
              format: "der",
            });
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              plaintext: crypto
                .publicEncrypt(
                  {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                  },
                  Buffer.from(key),
                )
                .toString("base64"),
              ciphertext_blob: "owned-kms-token",
            }),
          );
        } else {
          const dec = crypto.createDecipheriv(
              "aes-128-ecb",
              Buffer.from(key),
              null,
            ),
            plain = Buffer.concat([
              dec.update(Buffer.from(body.toString(), "base64")),
              dec.final(),
            ]).toString();
          received.push({
            plain,
            encrypted: req.headers.encrypted,
            compression: req.headers["galileo-compress"],
            encoding: req.headers["content-encoding"],
          });
          res.end("accepted");
        }
      } catch (e) {
        res.writeHead(500);
        res.end(String(e));
      }
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = "http://127.0.0.1:" + (server.address() as any).port,
      n: any = factory(runtime),
      t = new n.GalileoEncryptedOtlpHttpTransport(
        {
          url: base + "/traces",
          compression: "gzip",
          headers: () => ({ "Content-Type": "application/json" }),
          agentOptions: { keepAlive: true },
        },
        { endpointToKmsUrl: { [base]: base + "/kms" } },
      );
    try {
      const payload = Buffer.from('{"trace":"owned"}');
      for (let i = 0; i < 2; i++) {
        const r = await t.send(payload, 3000);
        assert.equal(r.status, "success", r.error?.message);
        assert.equal(r.data.toString(), "accepted");
      }
      assert.equal(keyRequests, 1);
      assert.equal(
        received[0].plain,
        n.galileoBase62Encode(zlib.gzipSync(payload)),
      );
      assert.equal(received[0].encrypted, "galileo-owned-kms-token");
      assert.equal(received[0].compression, "gzip");
      assert.equal(received[0].encoding, undefined);
      return { keyRequests, received };
    } finally {
      t.shutdown();
      await new Promise<void>((r) => server.close(() => r()));
    }
  },
});

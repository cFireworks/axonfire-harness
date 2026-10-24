import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { once } from "node:events";
import { gzipSync } from "node:zlib";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createNativeExpress } from "../../src/http/native-express.js";
const require = createRequire(import.meta.url);
type Factory = typeof createNativeExpress;
export function expressFixture(factory: Factory = createNativeExpress) {
  const proc = Object.create(process);
  Object.defineProperty(proc, "env", { value: { NODE_ENV: "test" } });
  return factory({ require, process: proc }).express;
}
async function close(server: any) {
  server.closeIdleConnections?.();
  await new Promise<void>((resolve, reject) =>
    server.close((error: any) => (error ? reject(error) : resolve())),
  );
}
export const EXPRESS_CASES = [
  {
    name: "original Express handles real gzip JSON, route params, queries, middleware errors and wildcard dispatch",
    async run(factory: Factory) {
      const express = expressFixture(factory),
        app = express();
      app.disable("etag");
      app.post(
        "/echo/:id",
        express.json({ limit: "1kb" }),
        (req: any, res: any) =>
          res.json({ id: req.params.id, body: req.body, query: req.query }),
      );
      app.get("/fail", () => {
        throw Error("owned route failure");
      });
      app.use((error: any, _req: any, res: any, _next: any) =>
        res
          .status(error.status ?? 500)
          .json({ error: error.type ?? error.message }),
      );
      app.all("*", (req: any, res: any) =>
        res.status(404).json({ path: req.path, method: req.method }),
      );
      const server = app.listen(0, "127.0.0.1");
      await once(server, "listening");
      const origin = `http://127.0.0.1:${server.address().port}`;
      try {
        const response = await fetch(origin + "/echo/owned?tag=a&tag=b", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "content-encoding": "gzip",
          },
          body: gzipSync('{"value":7}'),
        });
        const body = await response.json();
        assert.equal(response.status, 200);
        assert.deepEqual(body, {
          id: "owned",
          body: { value: 7 },
          query: { tag: ["a", "b"] },
        });
        const bad = await fetch(origin + "/echo/a", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        });
        assert.equal(bad.status, 400);
        assert.deepEqual(await bad.json(), { error: "entity.parse.failed" });
        const large = await fetch(origin + "/echo/a", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ value: "x".repeat(2048) }),
        });
        assert.equal(large.status, 413);
        assert.deepEqual(await large.json(), { error: "entity.too.large" });
        const failed = await fetch(origin + "/fail");
        assert.equal(failed.status, 500);
        assert.deepEqual(await failed.json(), { error: "owned route failure" });
        const wildcard = await fetch(origin + "/missing", { method: "DELETE" });
        assert.equal(wildcard.status, 404);
        assert.deepEqual(await wildcard.json(), {
          path: "/missing",
          method: "DELETE",
        });
        return {
          body,
          statuses: [
            200,
            bad.status,
            large.status,
            failed.status,
            wildcard.status,
          ],
        };
      } finally {
        await close(server);
      }
    },
  },
  {
    name: "original Express serves byte ranges and HEAD and merges router params",
    async run(factory: Factory) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "harness-express-")),
        express = expressFixture(factory),
        app = express();
      let server: any;
      try {
        fs.writeFileSync(path.join(dir, "owned.txt"), "0123456789");
        app.use("/files", express.static(dir));
        const router = express.Router({ mergeParams: true });
        router.get("/child/:child", (req: any, res: any) =>
          res.json(req.params),
        );
        app.use("/parent/:parent", router);
        server = app.listen(0, "127.0.0.1");
        await once(server, "listening");
        const origin = `http://127.0.0.1:${server.address().port}`;
        const ranged = await fetch(origin + "/files/owned.txt", {
          headers: { range: "bytes=2-5" },
        });
        assert.equal(ranged.status, 206);
        const text = await ranged.text();
        assert.equal(text, "2345");
        assert.equal(ranged.headers.get("content-range"), "bytes 2-5/10");
        const head = await fetch(origin + "/files/owned.txt", {
          method: "HEAD",
        });
        assert.equal(head.status, 200);
        assert.equal(head.headers.get("content-length"), "10");
        assert.equal(await head.text(), "");
        const params = await (await fetch(origin + "/parent/a/child/b")).json();
        assert.deepEqual(params, { parent: "a", child: "b" });
        return { text, params };
      } finally {
        if (server) await close(server);
        fs.rmSync(dir, { recursive: true, force: true });
      }
    },
  },
];

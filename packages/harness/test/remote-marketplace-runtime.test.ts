import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { marketplaceFixture } from "../scripts/helpers/marketplace-fixtures.js";
import { createOwnedMarketplaceIO } from "../src/plugins/owned-marketplace-io.js";
import { createOwnedPluginFilesystem } from "../src/plugins/owned-plugin-filesystem.js";
import { createNativeZipUtils } from "../src/plugins/native-zip-utils.js";
import { zipFixture, marketArchive } from "./helpers/marketplace-archive.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
setTraceProcessors([]);
async function fixture(t: any, overrides: any = {}) {
  const root = await fs.mkdtemp(join(tmpdir(), "remote-marketplace-")),
    io = createOwnedMarketplaceIO(root, createOwnedPluginFilesystem(root));
  t.after(async () => {
    await io.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  const f = marketplaceFixture(root, undefined, { ...io, ...overrides });
  await f.fsExtra.ensureDir(join(root, "tmp"));
  return { ...f, io, zip: createNativeZipUtils(f.runtime) };
}
function marketplace(f: any, type: string, url: string, name = "temp") {
  return f.classes.MarketplaceFactory.createFromJSON({
    name,
    source: { source: type, url, path: url },
    installLocation: "",
  });
}
async function server(t: any, fn: any) {
  const calls: string[] = [],
    s = createServer((req, res) => {
      calls.push(req.method + " " + req.url);
      fn(req, res);
    });
  await new Promise<void>((resolve) => s.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise<void>((resolve) => {
        s.closeAllConnections();
        s.close(() => resolve());
      }),
  );
  return { url: "http://127.0.0.1:" + (s.address() as any).port, calls };
}
test("native HTTP marketplace retains whole-base URL joining, metadata fallback and partial failures", async (t) => {
  const f = await fixture(t),
    remote = await server(t, (req: any, res: any) => {
      res.setHeader("Content-Type", "application/json");
      if (req.url === "/marketplace.json")
        res.end(
          JSON.stringify({
            name: "owned-http",
            plugins: [
              { name: "one", source: "plugins/one" },
              { name: "two", source: "plugins/two" },
              { name: "missing", source: "missing" },
            ],
          }),
        );
      else if (req.url.includes("missing")) {
        res.statusCode = 404;
        res.end("{}");
      } else if (req.url.includes(".claude-plugin"))
        res.end(
          JSON.stringify({
            name: req.url.includes("one") ? "one" : "two",
            version: "2.0.0",
          }),
        );
      else {
        res.statusCode = 404;
        res.end("{}");
      }
    });
  const m = marketplace(f, "url", remote.url + "/marketplace.json");
  await m.install();
  assert.equal(m.name, "owned-http");
  assert.match(
    JSON.stringify(f.events),
    /Failed to download plugin manifest for missing/,
  );
  assert.equal(m.detectedMetaDir, ".claude-plugin");
  const all = await m.listPlugins();
  assert.equal(all[0].version, "2.0.0");
  assert.ok(
    remote.calls.includes(
      "GET /marketplace.json/plugins/one/.claude-plugin/plugin.json",
    ),
  );
  assert.equal(
    remote.calls.filter((p) => p.startsWith("GET /marketplace.json")).length >
      2,
    true,
  );
  assert.equal(
    m.buildUrl("https://invalid.test/marketplace.json/", "/a"),
    "https://invalid.test/marketplace.json/a",
  );
});
test("native HTTP provider replaces duplicate metadata files and reports malformed manifest errors", async (t) => {
  const f = await fixture(t),
    remote = await server(t, (_: any, res: any) => {
      res.end('{"name":"owned"}');
    });
  const m = marketplace(f, "url", remote.url),
    dest = join(f.root, "dest");
  await f.fsExtra.ensureDir(join(dest, "plugin", ".claude-plugin"));
  await f.fsExtra.writeFile(
    join(dest, "plugin", ".claude-plugin", "plugin.json"),
    "{}",
  );
  await m.downloadPluginManifest(remote.url, dest, "plugin");
  assert.equal(
    await f.fsExtra.pathExists(
      join(dest, "plugin", ".claude-plugin", "plugin.json"),
    ),
    false,
  );
  await assert.rejects(
    m.downloadManifest(remote.url, dest),
    /Failed to download manifest/,
  );
});
test("native ZIP local install extracts, flattens, preserves metadata and updates atomically", async (t) => {
  const f = await fixture(t),
    file = join(f.root, "market.zip");
  await fs.writeFile(file, marketArchive());
  const m = marketplace(f, "zip", file);
  await m.install();
  assert.equal(m.name, "owned-zip");
  assert.equal((await m.listPlugins())[0].version, "1.0.0");
  const metadata = await f.zip.readZipMetadata(m.installLocation);
  assert.equal(metadata.installComplete, true);
  assert.equal(metadata.url, file);
  await fs.writeFile(file, marketArchive("owned-zip", "2.0.0"));
  await m.update();
  m.clearPluginListCache();
  assert.equal((await m.listPlugins())[0].version, "2.0.0");
  assert.deepEqual(await fs.readdir(join(f.root, "tmp")), []);
  assert.equal(
    (await fs.readdir(join(f.root, "plugins", "marketplaces"))).some(
      (p) => p.includes(".backup-") || p.includes(".staging-"),
    ),
    false,
  );
});
test("native remote ZIP follows redirects and main/master fallback, stores effective URL", async (t) => {
  const f = await fixture(t),
    remote = await server(t, (req: any, res: any) => {
      if (req.url === "/go") {
        res.statusCode = 302;
        res.setHeader("Location", "/repo-main.zip?owned=1");
        res.end();
      } else if (req.url.startsWith("/repo-main.zip")) {
        res.statusCode = 404;
        res.end();
      } else if (req.url.startsWith("/repo-master.zip")) {
        res.setHeader("ETag", '"owned"');
        res.end(marketArchive());
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
  const m = marketplace(f, "zip", remote.url + "/repo-main.zip?owned=1");
  await m.install();
  assert.equal(
    (await f.zip.readZipMetadata(m.installLocation)).url,
    remote.url + "/repo-master.zip?owned=1",
  );
  const out = join(f.root, "redirect.zip");
  await assert.rejects(f.zip.downloadFile(remote.url + "/go", out), /HTTP 404/);
  assert.ok(remote.calls.includes("GET /repo-main.zip?owned=1"));
});
test("native branch fallback is 404-only and attempts one alternate preserving query/hash", async (t) => {
  const calls: string[] = [],
    f = await fixture(t, {
      zipUtils: {
        downloadFile: async (url: string) => {
          calls.push(url);
          throw Error(url.includes("main") ? "HTTP 404" : "HTTP 503");
        },
      },
    });
  const m = marketplace(f, "zip", "owned");
  await assert.rejects(
    m.downloadWithBranchFallback(
      "https://invalid.test/repo-main.zip?q=1#frag",
      "owned",
    ),
    /fallback "master" also failed: HTTP 503/,
  );
  assert.deepEqual(calls, [
    "https://invalid.test/repo-main.zip?q=1#frag",
    "https://invalid.test/repo-master.zip?q=1#frag",
  ]);
  calls.length = 0;
  await assert.rejects(
    m.downloadWithBranchFallback("https://invalid.test/repo.zip", "owned"),
    /HTTP 503/,
  );
  assert.equal(calls.length, 1);
});
test("native ZIP swap restores previous directory after failed promotion", async (t) => {
  const f = await fixture(t),
    m = marketplace(f, "zip", "owned", "rollback"),
    dest = join(f.root, "dest"),
    source = join(f.root, "extract");
  await f.fsExtra.ensureDir(dest);
  await f.fsExtra.ensureDir(source);
  await f.fsExtra.writeFile(join(dest, "old"), "keep");
  await f.fsExtra.writeFile(join(source, "new"), "new");
  const native = m.renameDirectory.bind(m);
  m.renameDirectory = (from: string, to: string) =>
    from.includes(".staging-")
      ? Promise.reject(Error("promote"))
      : native(from, to);
  await assert.rejects(m.swapDirectoryFromTemp(source, dest), /promote/);
  assert.equal(await fs.readFile(join(dest, "old"), "utf8"), "keep");
  assert.equal(
    (await fs.readdir(f.root)).some(
      (p) => p.includes(".backup-") || p.includes(".staging-"),
    ),
    false,
  );
});
test("native ZIP swap preserves backup when both promotion and restoration fail", async (t) => {
  const f = await fixture(t),
    m = marketplace(f, "zip", "owned", "rollback"),
    dest = join(f.root, "dest"),
    source = join(f.root, "extract");
  await f.fsExtra.ensureDir(dest);
  await f.fsExtra.ensureDir(source);
  await f.fsExtra.writeFile(join(dest, "old"), "keep");
  const native = m.renameDirectory.bind(m);
  m.renameDirectory = (from: string, to: string) =>
    from === dest
      ? native(from, to)
      : Promise.reject(Error("owned disk failure"));
  await assert.rejects(
    m.swapDirectoryFromTemp(source, dest),
    /backup preserved at/,
  );
  const backup = (await fs.readdir(f.root)).find((p) => p.includes(".backup-"));
  assert.ok(backup);
  assert.equal(await fs.readFile(join(f.root, backup, "old"), "utf8"), "keep");
});
test("native orphan cleanup touches only matched old artefacts", async (t) => {
  const now = 1700000000000,
    f = await fixture(t, {
      Date: class extends Date {
        static override now() {
          return now;
        }
      },
    }),
    m = marketplace(f, "zip", "owned");
  const old = ".owned.backup-1." + (now - 4000000) + "-abcdef",
    recent = ".owned.backup-1." + now + "-abcdef";
  for (const name of [old, recent, "unmatched", ".old.123-abcdef"])
    await fs.writeFile(join(f.root, name), "keep");
  await m.cleanupOrphanArtifacts(f.root);
  assert.equal(await f.fsExtra.pathExists(join(f.root, old)), false);
  assert.equal(await f.fsExtra.pathExists(join(f.root, recent)), true);
  assert.equal(await f.fsExtra.pathExists(join(f.root, "unmatched")), true);
});
test("native ZIP extraction rejects traversal and keeps original gzip-not-tar behavior", async (t) => {
  const f = await fixture(t),
    file = join(f.root, "unsafe.zip"),
    dest = join(f.root, "extract");
  await fs.writeFile(file, zipFixture({ "../escape": "bad" }));
  await assert.rejects(f.zip.extractZip(file, dest), /Unsafe ZIP entry/);
  assert.equal(await f.fsExtra.pathExists(join(f.root, "escape")), false);
  const gz = join(f.root, "archive.tar.gz");
  await fs.writeFile(gz, gzipSync("plain decompressed bytes"));
  await f.zip.extractZip(gz, dest);
  assert.equal(
    await fs.readFile(join(dest, "archive.tar"), "utf8"),
    "plain decompressed bytes",
  );
});
test("native extraction flattens one directory and removes only ignored __MACOSX entries", async (t) => {
  const f = await fixture(t),
    file = join(f.root, "owned.zip"),
    dest = join(f.root, "extract");
  await fs.writeFile(
    file,
    zipFixture({
      "repo/owned.txt": "content",
      "__MACOSX/ignored.txt": "ignored",
    }),
  );
  await f.zip.extractZip(file, dest);
  assert.equal(await fs.readFile(join(dest, "owned.txt"), "utf8"), "content");
  assert.equal(await f.fsExtra.pathExists(join(dest, "__MACOSX")), false);
});
test("native ZIP metadata compares exact URL, installComplete, ETag and Last-Modified", async (t) => {
  const f = await fixture(t);
  let etag = '"a"',
    date = "Tue, 20 Oct 2026 00:00:00 GMT";
  const remote = await server(t, (_: any, res: any) => {
      if (etag) res.setHeader("ETag", etag);
      res.setHeader("Last-Modified", date);
      res.end();
    }),
    url = remote.url + "/owned.zip",
    dest = join(f.root, "dest");
  await f.fsExtra.ensureDir(dest);
  await f.zip.writeZipMetadata(dest, {
    url,
    installComplete: true,
    etag,
    lastModified: date,
  });
  assert.equal((await f.zip.checkZipNeedsUpdate(url, dest)).needsUpdate, false);
  etag = '"b"';
  assert.equal((await f.zip.checkZipNeedsUpdate(url, dest)).needsUpdate, true);
  etag = "";
  assert.equal((await f.zip.checkZipNeedsUpdate(url, dest)).needsUpdate, false);
  date = "Wed, 21 Oct 2026 00:00:00 GMT";
  assert.equal((await f.zip.checkZipNeedsUpdate(url, dest)).needsUpdate, true);
  assert.equal(
    (await f.zip.checkZipNeedsUpdate(url + "?different", dest)).needsUpdate,
    true,
  );
  assert.ok(remote.calls.every((p) => p.includes("_t=")));
});
test("native update checker retains throttle, URL version, HEAD classifications and invalidation", async (t) => {
  const f = await fixture(t),
    checker = f.updateChecker,
    dest = join(f.root, "dest");
  assert.equal(
    (
      await checker.needsUpdate({
        marketplaceName: "owned",
        installLocation: dest,
      })
    ).reason,
    "first-install",
  );
  await f.fsExtra.ensureDir(dest);
  await checker.commitVersion("owned", dest, " v1 ");
  assert.equal(await checker.readCachedVersion(dest), "v1");
  assert.equal(
    (
      await checker.needsUpdate({
        marketplaceName: "owned",
        installLocation: dest,
        urlVersion: "v2",
      })
    ).reason,
    "throttled",
  );
  await fs.utimes(join(dest, ".marketplace-version"), new Date(0), new Date(0));
  assert.equal(
    (
      await checker.needsUpdate({
        marketplaceName: "owned",
        installLocation: dest,
        urlVersion: "v1",
      })
    ).reason,
    "url-version-match",
  );
  await fs.utimes(join(dest, ".marketplace-version"), new Date(0), new Date(0));
  assert.equal(
    (
      await checker.needsUpdate({
        marketplaceName: "owned",
        installLocation: dest,
        urlVersion: "v2",
      })
    ).reason,
    "url-version-changed",
  );
  await checker.invalidateCache("owned", dest);
  assert.equal(await checker.readCachedVersion(dest), undefined);
  f.configuration.marketplaceVersionCheckIntervalMs = 10;
  assert.equal(checker.getCheckIntervalMs(), 10);
  assert.equal(
    checker.classifyHttpCheck(
      { needsUpdate: false, lastModified: "owned" },
      true,
    ),
    "last-modified-match",
  );
  assert.equal(
    checker.classifyHttpCheck({ needsUpdate: true }, false),
    "no-metadata",
  );
});
test("native ZIP helper and update checker preserve missing metadata and HEAD failure behavior", async (t) => {
  const f = await fixture(t),
    remote = await server(t, (_: any, res: any) => {
      res.statusCode = 503;
      res.end();
    }),
    dest = join(f.root, "dest");
  await f.fsExtra.ensureDir(dest);
  assert.deepEqual(await f.zip.checkZipNeedsUpdate(remote.url, dest), {
    needsUpdate: true,
  });
  assert.equal(
    (
      await f.updateChecker.needsUpdate({
        marketplaceName: "owned",
        installLocation: dest,
        zipUrl: remote.url,
      })
    ).reason,
    "no-metadata",
  );
  assert.equal(
    f.zip.parseVersionFromUrl(
      "owned-12345678-1234-1234-1234-123456789abc.zip?x",
    ),
    "12345678-1234-1234-1234-123456789abc",
  );
  assert.equal(f.zip.parseVersionFromUrl("main.zip"), null);
  assert.equal(f.zip.isLocalFilePath("file:///owned.zip"), true);
  assert.equal(f.zip.isZipUrl(remote.url + "/owned.tgz"), true);
});
test("native Git provider keeps command sequence, depth and cleanup of failed clones", async (t) => {
  const calls: any[] = [],
    f = await fixture(t, {
      exec: async (...args: any[]) => {
        calls.push(args);
        return { stdout: "owned-branch\n" };
      },
    }),
    m = marketplace(f, "git", "https://invalid.test/owned.git");
  const dest = join(f.root, "repo");
  await f.fsExtra.ensureDir(dest);
  await m.updateRepo(dest);
  assert.deepEqual(
    calls.map((c) => c[1]),
    [
      ["rev-parse", "--abbrev-ref", "HEAD"],
      ["fetch", "origin", "owned-branch", "--depth", "1"],
      ["reset", "--hard", "origin/owned-branch"],
      ["clean", "-fd"],
    ],
  );
  f.runtime.exec = async () => {
    throw Error("clone fail");
  }; // Runtime bindings captured at construction, use a new factory for this branch.
  const bad = await fixture(t, {
      exec: async (_: any, args: any[]) => {
        await fs.mkdir(args.at(-1), { recursive: true });
        throw Error("clone fail");
      },
    }),
    invalid = marketplace(bad, "git", "owned");
  await assert.rejects(
    invalid.cloneRepo("owned", join(bad.root, "partial")),
    /Failed to clone/,
  );
  assert.equal(await bad.fsExtra.pathExists(join(bad.root, "partial")), false);
});
test("native Git availability coalesces probes and converter retains all original rules", async (t) => {
  let calls = 0;
  const f = await fixture(t, {
      exec: async () => {
        calls++;
        return {};
      },
    }),
    detector = Object.assign(new f.classes.GitAvailabilityDetector(), {
      logger: f.runtime.services.logger,
    });
  assert.deepEqual(
    await Promise.all([detector.isAvailable(), detector.isAvailable()]),
    [true, true],
  );
  assert.equal(calls, 1);
  detector.invalidateCache();
  await detector.isAvailable();
  assert.equal(calls, 2);
  const converter = new f.classes.GitToZipUrlConverter();
  assert.equal(
    converter.convert("owner/repo"),
    "https://github.com/owner/repo/archive/refs/heads/main.zip",
  );
  assert.equal(
    converter.convert("git@gitee.com:owner/repo.git"),
    "https://gitee.com/owner/repo/repository/archive/master.zip",
  );
  assert.equal(
    converter.convert("https://gitlab.example.test/owner/repo.git"),
    "https://gitlab.example.test/owner/repo/-/archive/main/repo-main.zip",
  );
  assert.equal(converter.convert("ssh://invalid.test/repo"), undefined);
  converter.registerRule({
    match: () => true,
    convert: () => "owned override",
  });
  assert.equal(converter.convert("owner/repo"), "owned override");
});
test("owned Git process adapter rejects mutations outside state before launching git", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    f.io.exec("git", ["reset", "--hard"], { cwd: tmpdir() }),
    /outside owned state/,
  );
  await assert.rejects(f.io.exec("sh", ["-c", "owned"]), /Only git/);
  await assert.rejects(
    f.io.exec("git", [
      "clone",
      "--depth",
      "1",
      "owned",
      join(tmpdir(), "not-owned"),
    ]),
    /outside owned state/,
  );
});
test(
  "native Git marketplace clones and updates only an owned file:// fixture repository",
  { timeout: 15000 },
  async (t) => {
    const f = await fixture(t),
      source = join(f.root, "source"),
      bare = join(f.root, "origin.git");
    await fs.mkdir(source);
    const git = (args: string[], cwd = source) =>
      execFileSync(
        "git",
        [
          "-c",
          "user.name=Owned Fixture",
          "-c",
          "user.email=fixture@example.invalid",
          ...args,
        ],
        {
          cwd,
          env: {
            PATH: process.env.PATH,
            HOME: f.root,
            GIT_CONFIG_NOSYSTEM: "1",
            GIT_CONFIG_GLOBAL: join(f.root, "no-global-config"),
          },
          stdio: "pipe",
        },
      );
    git(["init", "-b", "main"]);
    await fs.mkdir(join(source, ".codebuddy-plugin"));
    await fs.writeFile(
      join(source, ".codebuddy-plugin", "marketplace.json"),
      '{"name":"owned-git","plugins":[]}',
    );
    await fs.writeFile(join(source, "version"), "one");
    git(["add", "."]);
    git(["commit", "-m", "owned initial"]);
    git(["clone", "--bare", source, bare]);
    const m = marketplace(f, "git", "file://" + bare);
    await m.install();
    assert.equal(m.name, "owned-git");
    assert.equal(
      await fs.readFile(join(m.installLocation, "version"), "utf8"),
      "one",
    );
    await fs.writeFile(join(source, "version"), "two");
    git(["commit", "-am", "owned update"]);
    git(["push", bare, "main"]);
    await fs.writeFile(join(m.installLocation, "untracked"), "owned junk");
    await m.update();
    assert.equal(
      await fs.readFile(join(m.installLocation, "version"), "utf8"),
      "two",
    );
    assert.equal(
      await f.fsExtra.pathExists(join(m.installLocation, "untracked")),
      false,
    );
  },
);
test(
  "owned marketplace close aborts pending HTTP manifest and download",
  { timeout: 10000 },
  async (t) => {
    const f = await fixture(t);
    let enter!: () => void;
    const entered = new Promise<void>((r) => {
      enter = r;
    });
    const remote = await server(t, (_: any, __: any) => enter());
    const m = marketplace(f, "url", remote.url),
      pending = m.fetchManifest(remote.url);
    void pending.catch(() => {});
    await entered;
    await f.io.close();
    await assert.rejects(pending, /Failed to fetch manifest/);
    await assert.rejects(f.io.exec("git", ["--version"]), /closed/);
  },
);
test(
  "real SDK installs configured remote ZIP into versioned cache and restores commands on restart",
  { timeout: 15000 },
  async (t) => {
    const f = await fixture(t),
      remote = await server(t, (_: any, res: any) => {
        res.setHeader("ETag", '"owned"');
        res.end(marketArchive());
      }),
      requests: any[] = [];
    const model: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse(request) {
        requests.push(request);
        yield { type: "response_started" };
        yield {
          type: "response_done",
          response: {
            id: "owned",
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            output: [
              {
                type: "message",
                role: "assistant",
                id: "owned-answer",
                status: "completed",
                content: [{ type: "output_text", text: "zip-settled" }],
              },
            ],
          },
        } as any;
      },
    };
    const stateDir = join(f.root, "state"),
      settings = {
        async get(key: string, scope: string) {
          if (scope !== "user") return;
          if (key === "extraKnownMarketplaces")
            return {
              "owned-zip": { source: "url", url: remote.url + "/owned.zip" },
            };
          if (key === "enabledPlugins") return { "zip-plugin@owned-zip": true };
        },
        clearCache() {},
      };
    for (let i = 0; i < 2; i++) {
      const h = await createHarness({
        workDir: f.root,
        stateDir,
        recordReplayEnv: {},
        productRuntime: { watch: false },
        modelProvider: { getModel: () => model },
        nativePlugins: { settings },
      });
      try {
        assert.ok(await h.agents.get("zip-expert"));
        assert.ok(await h.commandManager.get("/zip-plugin:echo"));
        const plugin = await h.pluginManager.getPlugin(
          "zip-plugin",
          "owned-zip",
        );
        assert.match(plugin.installedPath, /cache/);
        assert.equal(plugin.version, "1.0.0");
        const s = await h.openSession();
        await h.prompt(s, "/zip-plugin:echo argument" + i);
        assert.match(
          JSON.stringify(requests.at(-1).input),
          new RegExp("argument" + i),
        );
      } finally {
        await h.close();
      }
    }
    assert.equal(requests.length, 2);
    assert.equal(remote.calls.filter((p) => p.startsWith("GET ")).length, 1);
  },
);
test("native remote ZIP unchanged ETag avoids a second download and touches throttle cache", async (t) => {
  const f = await fixture(t),
    remote = await server(t, (_: any, res: any) => {
      res.setHeader("ETag", '"same"');
      res.end(marketArchive());
    });
  const m = marketplace(f, "zip", remote.url + "/owned.zip");
  await m.install();
  await m.update();
  await m.update();
  assert.equal(remote.calls.filter((p) => p.startsWith("GET ")).length, 1);
  assert.equal(remote.calls.filter((p) => p.startsWith("HEAD ")).length, 1);
  assert.equal(
    await f.fsExtra.pathExists(join(m.installLocation, ".marketplace-version")),
    true,
  );
});
test("native built-in ZIP URL UUID seeds and commits changed remote version", async (t) => {
  let version = "1.0.0";
  const f = await fixture(t),
    remote = await server(t, (_: any, res: any) =>
      res.end(marketArchive("owned-zip", version)),
    ),
    first = "12345678-1234-1234-1234-123456789abc",
    second = "12345678-1234-1234-1234-123456789def";
  f.configuration.builtInMarketplaces = {
    "owned-zip": { source: "zip", url: remote.url },
  };
  const m = marketplace(f, "zip", remote.url + "/owned-" + first + ".zip");
  await m.install();
  assert.equal(
    await f.updateChecker.readCachedVersion(m.installLocation),
    first,
  );
  version = "2.0.0";
  m.source.url = remote.url + "/owned-" + second + ".zip";
  await fs.utimes(
    join(m.installLocation, ".marketplace-version"),
    new Date(0),
    new Date(0),
  );
  await m.update();
  assert.equal(
    await f.updateChecker.readCachedVersion(m.installLocation),
    second,
  );
  m.clearPluginListCache();
  assert.equal((await m.listPlugins())[0].version, "2.0.0");
});
test("native HTTP header/download redirect limits reject loops without production network", async (t) => {
  const f = await fixture(t),
    remote = await server(t, (_: any, res: any) => {
      res.statusCode = 302;
      res.setHeader("Location", "/loop");
      res.end();
    });
  await assert.rejects(
    f.zip.downloadFile(remote.url, join(f.root, "download"), 0),
    /Too many redirects/,
  );
  await assert.rejects(
    f.zip.getRemoteHeaders(remote.url, 0),
    /Too many redirects/,
  );
});
test(
  "owned I/O close rejects in-progress archive body and drains all created resources",
  { timeout: 10000 },
  async (t) => {
    const f = await fixture(t);
    let started!: () => void;
    const ready = new Promise<void>((resolve) => {
      started = resolve;
    });
    const remote = await server(t, (_: any, res: any) => {
      res.writeHead(200);
      res.write(Buffer.alloc(1024));
      started();
    });
    const downloading = f.zip.downloadFile(
      remote.url,
      join(f.root, "partial.zip"),
    );
    void downloading.catch(() => {});
    await ready;
    await f.io.close();
    await assert.rejects(downloading, /closed/);
    assert.equal(f.io.ownedHandleCount, 0);
    await f.io.close();
  },
);
test("native local ZIP metadata comparison preserves mtime and missing-source behavior", async (t) => {
  const f = await fixture(t),
    file = join(f.root, "owned.zip"),
    dest = join(f.root, "dest");
  await fs.writeFile(file, marketArchive());
  await f.fsExtra.ensureDir(dest);
  const copied = await f.zip.copyLocalFile(file, join(f.root, "copied.zip"));
  await f.zip.writeZipMetadata(dest, {
    url: file,
    installComplete: true,
    lastModified: copied.lastModified,
  });
  assert.equal(
    (await f.zip.checkLocalZipNeedsUpdate(file, dest)).needsUpdate,
    false,
  );
  await fs.utimes(file, new Date(0), new Date(0));
  assert.equal(
    (await f.zip.checkLocalZipNeedsUpdate(file, dest)).needsUpdate,
    true,
  );
  await fs.rm(file);
  assert.equal(
    (await f.zip.checkLocalZipNeedsUpdate(file, dest)).needsUpdate,
    true,
  );
});
test("native ZIP provider retains archive filename .zip even for local tgz input", async (t) => {
  const f = await fixture(t),
    file = join(f.root, "owned.tgz");
  await fs.writeFile(file, gzipSync("not a ZIP"));
  const m = marketplace(f, "zip", file);
  await assert.rejects(m.install(), /Failed to extract ZIP file/);
  assert.deepEqual(await fs.readdir(join(f.root, "tmp")), []);
});
test(
  "owned close waits for an archive open callback already in progress",
  { timeout: 10000 },
  async (t) => {
    const f = await fixture(t),
      file = join(f.root, "open.zip");
    await fs.writeFile(file, marketArchive());
    const opened = new Promise<void>((resolve) =>
      f.io.yauzl.open(file, { lazyEntries: true }, (error: any) => {
        assert.match(error.message, /closed/);
        resolve();
      }),
    );
    await f.io.close();
    await opened;
    assert.equal(f.io.ownedHandleCount, 0);
  },
);
test("native rename helper preserves retry schedule and bounded failure", async (t) => {
  const f = await fixture(t),
    delays: number[] = [];
  let attempts = 0;
  const z = createNativeZipUtils({
    ...f.runtime,
    fsExtra: {
      ...f.fsExtra,
      rename: async () => {
        attempts++;
        throw Object.assign(Error("busy"), { code: "EPERM" });
      },
    },
    setTimeout: (fn: any, ms: number) => {
      delays.push(ms);
      queueMicrotask(fn);
    },
  });
  await assert.rejects(z.renameWithRetry("owned", "owned"), /busy/);
  assert.equal(attempts, 4);
  assert.deepEqual(delays, [100, 200, 400]);
});

import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { marketplaceFixture } from "./marketplace-fixtures.js";
import { createNativeMarketplace } from "../../src/plugins/native-marketplace.js";
import { createNativeFileLock } from "../../src/tasks/native-file-lock.js";
import { createNativeZipUtils } from "../../src/plugins/native-zip-utils.js";
import { marketArchive } from "../../test/helpers/marketplace-archive.js";
import { characterizeFileLockPublicationRace } from "./file-lock-race-fixture.js";
export async function remoteMarketplaceDifferential(
  root: string,
  captured: any,
) {
  async function scenarios(home: string, factories: any) {
    const out: any[] = [],
      downloads: string[] = [],
      commands: any[] = [];
    out.push(await characterizeFileLockPublicationRace(home, factories.locks));
    let downloadFailure = true,
      gitFailure = false;
    const f = marketplaceFixture(home, factories, {
      Date: class extends Date {
        static override now() {
          return 1700000000000;
        }
      },
      Math: { random: () => 0.123456789 },
      exec: async (...args: any[]) => {
        commands.push(args);
        if (gitFailure) throw Error("owned git failure");
        return { stdout: "main\n" };
      },
      fetch: async (url: string) => ({
        ok: !url.includes("failure"),
        status: 404,
        statusText: "Not Found",
        json: async () => ({ name: "owned-http", plugins: [] }),
      }),
    });
    const make = (type: string, source: any = {}) =>
      f.classes.MarketplaceFactory.createFromJSON({
        name: "owned",
        source: { source: type, ...source },
        installLocation: join(home, "installed"),
      });
    const z = factories.zip(f.runtime),
      converter = new f.classes.GitToZipUrlConverter();
    const urls = [
      "owner/repo",
      "git@github.com:owner/repo.git",
      "https://github.com/owner/repo.git",
      "https://cnb.cool/owner/repo",
      "https://sub.cnb.cool/owner/repo",
      "https://cnb.woa.com/owner/repo",
      "https://git.woa.com/owner/repo",
      "https://gitlab.com/owner/repo",
      "https://gitlab.example.test/owner/repo.git",
      "https://gitee.com/owner/repo",
      "https://bitbucket.org/owner/repo",
      "https://unknown.example.test/owner/repo",
      "https://github.com/",
      "ssh://github.com/owner/repo",
      "",
      " C:/local/repo.zip ",
    ];
    for (const url of urls) {
      out.push(converter.normaliseToHttpUrl(url), converter.convert(url));
      const zip = make("zip", { url });
      out.push(
        zip.generateNameFromUrl(url),
        zip.slugify(url),
        z.isZipUrl(url),
        z.isLocalFilePath(url),
        z.parseVersionFromUrl(url),
      );
      const http = make("url", { url });
      out.push(
        http.generateNameFromUrl(url),
        http.buildUrl(url, "/plugin/.claude-plugin/plugin.json"),
      );
    }
    converter.registerRule({
      match: () => true,
      convert: () => "owned override",
    });
    out.push(converter.convert("owner/repo"));
    for (const source of [
      { repo: "owner/repo", url: "url", path: "path" },
      { url: "url", path: "path" },
      { path: "path" },
      {},
    ])
      for (const [type, method] of [
        ["git", "getGitUrl"],
        ["url", "getHttpUrl"],
        ["zip", "getZipUrl"],
      ]) {
        const m = make(type!, source);
        try {
          out.push(m[method!]());
        } catch (error: any) {
          out.push(error.message);
        }
      }
    const git = make("git", { url: "owned" });
    await git.updateRepo(join(home, "repo"));
    out.push(commands.splice(0));
    gitFailure = true;
    out.push(await git.isValidGitRepo(join(home, "repo")));
    try {
      await git.updateRepo(join(home, "repo"));
    } catch (error: any) {
      out.push(error.message);
    }
    const detector = Object.assign(new f.classes.GitAvailabilityDetector(), {
      logger: f.runtime.services.logger,
    });
    out.push(await detector.isAvailable(), await detector.isAvailable());
    gitFailure = false;
    out.push(await detector.isAvailable());
    detector.invalidateCache();
    out.push(await detector.isAvailable());
    for (const url of [
      "https://invalid.test/owned",
      "https://invalid.test/failure",
    ]) {
      const m = make("url", { url });
      try {
        out.push(await m.fetchManifest(url));
      } catch (error: any) {
        out.push(error.message);
      }
    }
    for (const flag of [true, false])
      for (const etag of [undefined, '"a"'])
        for (const lastModified of [undefined, "owned"])
          for (const metadata of [true, false])
            out.push(
              f.updateChecker.classifyHttpCheck(
                { needsUpdate: flag, etag, lastModified },
                metadata,
              ),
            );
    for (const value of [undefined, 0, -1, 1, 12345, "10"]) {
      f.configuration.marketplaceVersionCheckIntervalMs = value;
      out.push(f.updateChecker.getCheckIntervalMs());
    }
    const base = await factories.zip(f.runtime);
    base.downloadFile = async (url: string) => {
      downloads.push(url);
      if (downloadFailure)
        throw Error(
          url.includes("main")
            ? "Failed to download: HTTP 404"
            : "Failed to download: HTTP 503",
        );
      return { etag: '"owned"' };
    };
    const alt = factories.marketplace({ ...f.runtime, zipUtils: base });
    for (const url of [
      "https://invalid.test/main.zip",
      "https://invalid.test/repo-main.zip?q=1#h",
      "https://invalid.test/archive.zip",
      "https://invalid.test/master.zip",
    ]) {
      const m = alt.MarketplaceFactory.createFromJSON({
        name: "owned",
        source: { source: "zip", url },
      });
      try {
        out.push(await m.downloadWithBranchFallback(url, join(home, "dest")));
      } catch (error: any) {
        out.push(error.message);
      }
      out.push(downloads.splice(0));
    }
    downloadFailure = false;
    const versioned = "owned-12345678-1234-1234-1234-123456789abc.zip";
    out.push(z.parseVersionFromUrl(versioned));
    await mkdir(join(home, "tmp"), { recursive: true });
    const file = join(home, "owned.zip");
    await writeFile(file, marketArchive());
    const m = make("zip", { path: file });
    await m.install();
    out.push(
      m.name,
      (await m.listPlugins()).map((p: any) => [
        p.name,
        p.version,
        p.marketplaceName,
      ]),
      (await z.readZipMetadata(m.installLocation)).installComplete,
    );
    const old = join(home, "previous"),
      extracted = join(home, "extracted");
    await mkdir(old);
    await writeFile(join(old, "marker"), "old");
    await mkdir(extracted);
    await writeFile(join(extracted, "marker"), "new");
    const nativeRename = m.renameDirectory.bind(m);
    m.renameDirectory = (from: string, to: string) =>
      from.includes(".staging-")
        ? Promise.reject(Error("promotion failure"))
        : nativeRename(from, to);
    try {
      await m.swapDirectoryFromTemp(extracted, old);
    } catch (error: any) {
      out.push(error.message);
    }
    out.push(await readFile(join(old, "marker"), "utf8"));
    return JSON.parse(JSON.stringify(out).replaceAll(home, "<OWNED>"));
  }
  const original = await scenarios(join(root, "remote-captured"), captured),
    restored = await scenarios(join(root, "remote-restored"), {
      marketplace: createNativeMarketplace,
      locks: createNativeFileLock,
      zip: createNativeZipUtils,
    });
  assert.equal(restored.length, original.length);
  for (let i = 0; i < original.length; i++)
    assert.deepEqual(
      restored[i],
      original[i],
      "remote marketplace scenario " + i,
    );
  return original.length;
}

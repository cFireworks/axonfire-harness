// Complete original module 14783 helpers, explicit owned I/O bindings only.
import * as fs from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import * as path from "node:path";
import * as zlib from "node:zlib";
import * as streams from "node:stream/promises";
import { createRequire } from "node:module";
export function createNativeZipUtils(runtime: any) {
  const Promise: any = globalThis.Promise,
    ep: any = runtime.streamFs ?? fs,
    eg = runtime.fsExtra,
    eh = runtime.http ?? http,
    ef = runtime.https ?? https,
    em = path,
    eE = streams,
    eC: any = runtime.yauzl ?? createRequire(import.meta.url)("yauzl"),
    ey = zlib,
    Date = runtime.Date ?? globalThis.Date,
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    eu = { ContainerUtil: { get: (_key: any) => runtime.services.logger } },
    ed = { Logger: "logger" },
    ew = ".zip-metadata.json",
    eB = 60000,
    e_ = 30000,
    eI = new Set(["__MACOSX"]);
  // UTF-16 9845680..9845846
  function parseVersionFromUrl(eA: any): any {
    try {
      let el: any = eA.match(
        /-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.zip/i,
      );
      return el?.[1] ?? null;
    } catch {
      return null;
    }
  }
  // UTF-16 9845846..9845897
  function getMetadataPath(eA: any): any {
    return em.join(eA, ew);
  }
  // UTF-16 9845897..9846033
  async function readZipMetadata(eA: any): Promise<any> {
    let el: any = getMetadataPath(eA);
    if (await eg.pathExists(el))
      try {
        return await eg.readJSON(el);
      } catch {
        return;
      }
  }
  // UTF-16 9846033..9846126
  async function writeZipMetadata(eA: any, el: any): Promise<any> {
    await eg.writeJSON(getMetadataPath(eA), el, { spaces: 2 });
  }
  // UTF-16 9846126..9846215
  function isLocalFilePath(eA: any): any {
    return !eA.startsWith("http://") && !eA.startsWith("https://");
  }
  // UTF-16 9846215..9846371
  function isZipUrl(eA: any): any {
    try {
      let el: any = new URL(eA).pathname.toLowerCase();
      return (
        el.endsWith(".zip") || el.endsWith(".tgz") || el.endsWith(".tar.gz")
      );
    } catch {
      return !1;
    }
  }
  // UTF-16 9846371..9846467
  function appendTimestamp(eA: any): any {
    let el: any = eA.includes("?") ? "&" : "?";
    return `${eA}${el}_t=${Date.now()}`;
  }
  // UTF-16 9846467..9847158
  async function getRemoteHeaders(eA: any, el: any = 5): Promise<any> {
    return new Promise((ec: any, eu: any) => {
      let makeRequest: any = (eA: any, ed: any) => {
        let ep: any = new URL(appendTimestamp(eA)),
          eg: any = ("https:" === ep.protocol ? ef : eh).request(
            {
              method: "HEAD",
              hostname: ep.hostname,
              port: ep.port,
              path: ep.pathname + ep.search,
              timeout: e_,
            },
            (ep: any) => {
              let eg: any = ep.statusCode ?? 0;
              eg >= 300 && eg < 400 && ep.headers.location
                ? ed >= el
                  ? eu(Error(`Too many redirects (max: ${el})`))
                  : makeRequest(
                      ep.headers.location.startsWith("http")
                        ? ep.headers.location
                        : new URL(ep.headers.location, eA).toString(),
                      ed + 1,
                    )
                : 200 !== eg
                  ? eu(Error(`Failed to get headers: HTTP ${eg}`))
                  : ec(ep.headers);
            },
          );
        (eg.on("error", eu),
          eg.on("timeout", () => {
            (eg.destroy(), eu(Error("HEAD request timeout")));
          }),
          eg.end());
      };
      makeRequest(eA, 0);
    });
  }
  // UTF-16 9847158..9847966
  async function downloadFile(eA: any, el: any, ec: any = 5): Promise<any> {
    return new Promise((eu: any, ed: any) => {
      let start: any = (eA: any, em: any) => {
        let eE: any = ("https:" === new URL(eA).protocol ? ef : eh).get(
          eA,
          (eh: any) => {
            let ef: any = eh.statusCode ?? 0;
            if (ef >= 300 && ef < 400 && eh.headers.location)
              return em >= ec
                ? void ed(Error(`Too many redirects (max: ${ec})`))
                : void start(
                    eh.headers.location.startsWith("http")
                      ? eh.headers.location
                      : new URL(eh.headers.location, eA).toString(),
                    em + 1,
                  );
            if (200 !== ef)
              return void ed(Error(`Failed to download: HTTP ${ef}`));
            let eE: any = (0, ep.createWriteStream)(el);
            (eh.pipe(eE),
              eE.on("finish", () => {
                (eE.close(),
                  eu({
                    lastModified: eh.headers["last-modified"],
                    etag: eh.headers.etag,
                  }));
              }),
              eE.on("error", (eA: any) => {
                (eg.unlink(el).catch(() => {}), ed(eA));
              }));
          },
        );
        (eE.on("error", (eA: any) => {
          (eg.unlink(el).catch(() => {}), ed(eA));
        }),
          eE.setTimeout(eB, () => {
            (eE.destroy(), ed(Error("Download timeout")));
          }));
      };
      start(eA, 0);
    });
  }
  // UTF-16 9847966..9848089
  async function copyLocalFile(eA: any, el: any): Promise<any> {
    return (
      await eg.copyFile(eA, el),
      { lastModified: (await eg.stat(eA)).mtime.toUTCString() }
    );
  }
  // UTF-16 9848089..9848615
  async function checkZipNeedsUpdate(
    eA: any,
    el: any,
    ec: any = 5,
  ): Promise<any> {
    let eu: any,
      ed: any = await readZipMetadata(el);
    try {
      eu = await getRemoteHeaders(eA, ec);
    } catch {
      return { needsUpdate: !0 };
    }
    let ep: any = eu["last-modified"],
      eg: any = Array.isArray(eu.etag) ? eu.etag[0] : eu.etag;
    return ed && ed.installComplete && ed.url === eA
      ? eg && ed.etag
        ? { needsUpdate: eg !== ed.etag, lastModified: ep, etag: eg }
        : ep && ed.lastModified
          ? {
              needsUpdate:
                new Date(ep).getTime() > new Date(ed.lastModified).getTime(),
              lastModified: ep,
              etag: eg,
            }
          : { needsUpdate: !0, lastModified: ep, etag: eg }
      : { needsUpdate: !0, lastModified: ep, etag: eg };
  }
  // UTF-16 9848615..9848959
  async function checkLocalZipNeedsUpdate(eA: any, el: any): Promise<any> {
    let ec: any = await readZipMetadata(el);
    if (!ec || !ec.installComplete || ec.url !== eA) return { needsUpdate: !0 };
    try {
      let el: any = (await eg.stat(eA)).mtime.toUTCString();
      if (ec.lastModified && el !== ec.lastModified)
        return { needsUpdate: !0, lastModified: el };
      return { needsUpdate: !1, lastModified: el };
    } catch {
      return { needsUpdate: !0 };
    }
  }
  // UTF-16 9848959..9849122
  async function extractZip(eA: any, el: any, ec: any = !0): Promise<any> {
    (await eg.ensureDir(el), eA.endsWith(".gz") || eA.endsWith(".tgz"))
      ? await extractGzip(eA, el)
      : await extractZipArchive(eA, el, ec);
  }
  // UTF-16 9849122..9849299
  async function extractGzip(eA: any, el: any): Promise<any> {
    let ec: any = em.join(el, em.basename(eA, ".gz"));
    await (0, eE.pipeline)(
      (0, ep.createReadStream)(eA),
      (0, ey.createGunzip)(),
      (0, ep.createWriteStream)(ec),
    );
  }
  // UTF-16 9849299..9849552
  async function extractZipArchive(eA: any, el: any, ec: any): Promise<any> {
    try {
      (await extractZipWithYauzl(eA, el),
        await ensureReadWritePermissions(el),
        ec && (await flattenSingleDirectory(el)));
    } catch (eA: any) {
      throw Error(
        `Failed to extract ZIP file: ${eA instanceof Error ? eA.message : String(eA)}`,
      );
    }
  }
  // UTF-16 9849552..9850463
  async function extractZipWithYauzl(eA: any, el: any): Promise<any> {
    return new Promise((ec: any, eu: any) => {
      eC.open(
        eA,
        { lazyEntries: !0, decodeStrings: !1 },
        (eA: any, ed: any) => {
          if (eA || !ed)
            return void eu(eA ?? Error("Failed to open ZIP archive"));
          let eh: any = em.resolve(el);
          (ed.on("error", eu),
            ed.on("end", ec),
            ed.on("entry", (eA: any) => {
              let el: any = eA.fileName,
                ec: any = Buffer.isBuffer(el)
                  ? el.toString("utf8")
                  : String(el),
                ef: any = em.resolve(eh, ec);
              if (!ef.startsWith(eh + em.sep) && ef !== eh) {
                (eu(Error(`Unsafe ZIP entry path detected: ${ec}`)),
                  ed.close());
                return;
              }
              /\/$/.test(ec)
                ? eg
                    .ensureDir(ef)
                    .then(() => ed.readEntry())
                    .catch(eu)
                : eg
                    .ensureDir(em.dirname(ef))
                    .then(() => {
                      ed.openReadStream(eA, (el: any, ec: any) => {
                        if (el || !ec)
                          return void eu(
                            el ?? Error("Failed to open entry read stream"),
                          );
                        let eh: any = (0, ep.createWriteStream)(ef);
                        (ec.on("end", () => {
                          let el: any =
                            (eA.externalFileAttributes >>> 16) & 65535;
                          (el && eg.chmod(ef, el).catch(() => {}),
                            ed.readEntry());
                        }),
                          ec.on("error", eu),
                          eh.on("error", eu),
                          ec.pipe(eh));
                      });
                    })
                    .catch(eu);
            }),
            ed.readEntry());
        },
      );
    });
  }
  // UTF-16 9850463..9850797
  async function ensureReadWritePermissions(eA: any): Promise<any> {
    try {
      for (let el of await eg.readdir(eA, { withFileTypes: !0 })) {
        let ec: any = em.join(eA, el.name);
        if (el.isDirectory()) {
          let eA: any = await eg.stat(ec);
          (await eg.chmod(ec, 448 | eA.mode),
            await ensureReadWritePermissions(ec));
        } else if (el.isFile()) {
          let eA: any = await eg.stat(ec);
          await eg.chmod(ec, 384 | eA.mode);
        }
      }
    } catch {}
  }
  // UTF-16 9850797..9851368
  async function flattenSingleDirectory(eA: any): Promise<any> {
    try {
      let el: any = await eg.readdir(eA),
        ec: any = el.filter((eA: any) => !eI.has(eA));
      if (1 !== ec.length) return;
      let eu: any = ec[0],
        ed: any = em.join(eA, eu);
      if (!(await eg.stat(ed)).isDirectory()) return;
      for (let ec of el.filter((eA: any) => eI.has(eA)))
        await eg.rm(em.join(eA, ec), {
          recursive: !0,
          force: !0,
          maxRetries: 3,
          retryDelay: 100,
        });
      for (let el of await eg.readdir(ed))
        await renameWithRetry(em.join(ed, el), em.join(eA, el));
      await eg.rm(ed, {
        recursive: !0,
        force: !0,
        maxRetries: 3,
        retryDelay: 100,
      });
    } catch (eA: any) {
      eu.ContainerUtil.get(ed.Logger).warn(
        "Failed to flatten single directory:",
        eA,
      );
    }
  }
  // UTF-16 9851368..9851651
  async function renameWithRetry(eA: any, el: any, ec: any = 3): Promise<any> {
    for (let eu: any = 0; eu <= ec; eu++)
      try {
        await eg.rename(eA, el);
        return;
      } catch (el: any) {
        let eA: any = el?.code;
        if (("EBUSY" === eA || "EPERM" === eA || "EACCES" === eA) && eu < ec) {
          let eA: any = Math.min(100 * Math.pow(2, eu), 1e3);
          await new Promise((el: any) => setTimeout(el, eA));
          continue;
        }
        throw el;
      }
  }
  return {
    parseVersionFromUrl,
    getMetadataPath,
    readZipMetadata,
    writeZipMetadata,
    isLocalFilePath,
    isZipUrl,
    appendTimestamp,
    getRemoteHeaders,
    downloadFile,
    copyLocalFile,
    checkZipNeedsUpdate,
    checkLocalZipNeedsUpdate,
    extractZip,
    extractGzip,
    extractZipArchive,
    extractZipWithYauzl,
    ensureReadWritePermissions,
    flattenSingleDirectory,
    renameWithRetry,
  };
}

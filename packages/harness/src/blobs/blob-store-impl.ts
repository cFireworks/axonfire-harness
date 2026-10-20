// codebuddy.js UTF-16 7343391..7344212; native methods with explicit I/O boundary.
import { createHash } from "node:crypto";
import * as path from "node:path";
import type { BlobRuntime } from "./blob-runtime.js";
export class BlobStoreImpl {
  [key: string]: any;
  logger: BlobRuntime["logger"];
  constructor(
    readonly runtime: BlobRuntime,
    dependencies: Record<string, any> = {},
  ) {
    this.logger = runtime.logger;
    Object.assign(this, dependencies);
  }
  init(): any {
    this.logger.setContext("BlobStore");
  }
  async store(eA: any, el: any, ec?: any, eu?: any): Promise<any> {
    let ed: any = Buffer.from(eA, "base64"),
      ep: any = createHash("sha256").update(ed).digest("hex"),
      eg: any = this.getBlobPath(ep, el);
    return (
      this.runtime.existsSync(eg) ||
        (await (0, this.runtime.fs.mkdir)((0, path.dirname)(eg), {
          recursive: !0,
        }),
        await (0, this.runtime.fs.writeFile)(eg, ed),
        this.logger.debug(
          `Blob stored: ${ep.substring(0, 12)}... (${ed.length} bytes)`,
        )),
      {
        type: "image_blob_ref",
        blob_id: ep,
        mime: el,
        size: ed.length,
        source: ec,
        blob_path: eg,
        original_filename: eu,
      }
    );
  }
  async read(eA: any, el: any): Promise<any> {
    let ec: any = this.getBlobPath(eA, el);
    try {
      return (await (0, this.runtime.fs.readFile)(ec)).toString("base64");
    } catch {
      this.logger.warn(`Blob not found: ${eA.substring(0, 12)}...`);
      return;
    }
  }
  async exists(eA: any, el: any): Promise<any> {
    try {
      return (await (0, this.runtime.fs.access)(this.getBlobPath(eA, el)), !0);
    } catch {
      return !1;
    }
  }
  getBlobPath(eA: any, el: any): any {
    return this.runtime.paths.getBlobPath(eA, el);
  }
}

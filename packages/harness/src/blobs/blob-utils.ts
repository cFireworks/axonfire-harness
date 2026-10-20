import * as ef from "node:path";
import { NativeImageMime } from "../models/image-mime.js";
export const formatBlobFileSize = function (eA: any): any {
  return void 0 === eA
    ? ""
    : eA < 1024
      ? `${eA}B`
      : eA < 1048576
        ? `${(eA / 1024).toFixed(1)}KB`
        : `${(eA / 1048576).toFixed(1)}MB`;
};
export class BlobPathUtils {
  static getHomeDir: () => string;
  static MIME_EXT_MAP: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
  };
  static getBlobsDir(): any {
    return (0, ef.join)(this.getHomeDir(), "blobs");
  }
  static getBlobPath(eA: any, el: any): any {
    let ec: any = eA.substring(0, 2),
      eu: any = el ? this.mimeToExt(el) : "bin";
    return (0, ef.join)(this.getBlobsDir(), ec, `${eA}.${eu}`);
  }
  static mimeToExt(eA: any): any {
    return this.MIME_EXT_MAP[eA] || "bin";
  }
}
export class BlobImageMime extends NativeImageMime {
  static IMAGE_MIME_TYPE_MAP: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    jpe: "image/jpeg",
    jfif: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    svgz: "image/svg+xml",
    bmp: "image/bmp",
    dib: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
    ico: "image/x-icon",
    cur: "image/x-icon",
    avif: "image/avif",
    heic: "image/heic",
    heif: "image/heif",
  };
  static async getImageMimeTypeAsync(eA: any, el: any): Promise<any> {
    try {
      let ec: any = await el(eA, { flag: "r" }),
        eu: any = this.detectMimeFromMagicBytes(ec);
      if (eu) return eu;
      let ed: any = ef.extname(eA).toLowerCase().substring(1);
      return this.IMAGE_MIME_TYPE_MAP[ed] || "image/png";
    } catch {
      let el: any = ef.extname(eA).toLowerCase().substring(1);
      return this.IMAGE_MIME_TYPE_MAP[el] || "image/png";
    }
  }
}

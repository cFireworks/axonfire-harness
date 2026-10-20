export class NativeImageMime {
  static detectMimeFromMagicBytes(eA: any): any {
    if (!(eA.length < 2)) {
      if (137 === eA[0] && 80 === eA[1] && 78 === eA[2] && 71 === eA[3])
        return "image/png";
      if (255 === eA[0] && 216 === eA[1] && 255 === eA[2]) return "image/jpeg";
      if (71 === eA[0] && 73 === eA[1] && 70 === eA[2] && 56 === eA[3])
        return "image/gif";
      if (
        eA.length >= 12 &&
        82 === eA[0] &&
        73 === eA[1] &&
        70 === eA[2] &&
        70 === eA[3] &&
        87 === eA[8] &&
        69 === eA[9] &&
        66 === eA[10] &&
        80 === eA[11]
      )
        return "image/webp";
      if (66 === eA[0] && 77 === eA[1]) return "image/bmp";
      if (
        (eA.length >= 4 &&
          73 === eA[0] &&
          73 === eA[1] &&
          42 === eA[2] &&
          0 === eA[3]) ||
        (eA.length >= 4 &&
          77 === eA[0] &&
          77 === eA[1] &&
          0 === eA[2] &&
          42 === eA[3])
      )
        return "image/tiff";
    }
  }
  static detectMimeFromBase64(eA: any): any {
    if ("string" != typeof eA || 0 === eA.length) return "image/png";
    let el: any = eA.match(/^data:([^;,]+)[;,]/);
    if (el) return el[1];
    try {
      let el: any = Buffer.from(eA.slice(0, 24), "base64");
      return this.detectMimeFromMagicBytes(el) || "image/png";
    } catch {
      return "image/png";
    }
  }
}
export const detectMimeFromBase64 = (value: any) =>
  NativeImageMime.detectMimeFromBase64(value);

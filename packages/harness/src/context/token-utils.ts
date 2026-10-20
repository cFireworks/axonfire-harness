// Native TokenUtils; standalone to avoid history/input module initialization cycles.
export class TokenUtils {
  static _IMAGE_CONTENT_TYPES = new Set([
    "image_url",
    "image",
    "input_image",
    "image_blob_ref",
  ]);
  static estimateTokensRough(eA: any): any {
    let el: any = (eA.match(/[\u4e00-\u9fa5]/g) || []).length,
      ec: any = eA.length - el;
    return Math.ceil(el / 1.8) + Math.ceil(ec / 4);
  }
  static createItemWithoutImages(eA: any): any {
    if (!eA || "object" != typeof eA) return eA;
    try {
      let el: any = JSON.parse(JSON.stringify(eA));
      return (TokenUtils._stripImages(el), el);
    } catch {
      return eA;
    }
  }
  static _stripImages(eA: any): any {
    if (eA && "object" == typeof eA)
      if (Array.isArray(eA))
        for (let el: any = 0; el < eA.length; el++) {
          let ec: any = eA[el];
          ec && "object" == typeof ec
            ? TokenUtils._IMAGE_CONTENT_TYPES.has(ec.type)
              ? (eA[el] = { type: ec.type, _imageOmitted: !0 })
              : TokenUtils._stripImages(ec)
            : "string" == typeof ec &&
              (eA[el] = TokenUtils._stripImagesFromString(ec));
        }
      else
        for (let el of Object.keys(eA)) {
          if (TokenUtils._IMAGE_CONTENT_TYPES.has(el)) {
            eA[el] = "[image_omitted]";
            continue;
          }
          let ec: any = eA[el];
          "string" == typeof ec
            ? (eA[el] = TokenUtils._stripImagesFromString(ec))
            : ec && "object" == typeof ec && TokenUtils._stripImages(ec);
        }
  }
  static _stripImagesFromString(eA: any): any {
    if (eA.startsWith("data:image/")) return "[image_omitted]";
    let el: any = eA.trimStart();
    if (0 === el.length) return eA;
    let ec: any = el.charCodeAt(0);
    if (
      (91 !== ec && 123 !== ec) ||
      (!eA.includes("image_url") &&
        !eA.includes("image_blob_ref") &&
        !eA.includes('"image"') &&
        !eA.includes('"input_image"') &&
        !eA.includes("data:image/"))
    )
      return eA;
    try {
      let el: any = JSON.parse(eA);
      if (el && "object" == typeof el)
        return (TokenUtils._stripImages(el), JSON.stringify(el));
    } catch {}
    return eA;
  }
  static estimateTrailingToolResultTokens(eA: any): any {
    let el: any = 0;
    for (let ec: any = eA.length - 1; ec >= 0; ec--) {
      let eu: any = eA[ec];
      if (eu?.type === "function_call_result") {
        let eA: any = TokenUtils.createItemWithoutImages(eu),
          ec: any = "";
        try {
          ec = JSON.stringify(eA);
        } catch {
          ec = String(eu);
        }
        el += TokenUtils.estimateTokensRough(ec);
      } else if (eu?.type === "function_call") continue;
      else break;
    }
    return el;
  }
}

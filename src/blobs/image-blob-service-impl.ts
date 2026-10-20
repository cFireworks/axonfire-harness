// codebuddy.js UTF-16 7345147..7353749; native methods with explicit I/O boundary.
import type { BlobRuntime } from "./blob-runtime.js";
import type { BlobStoreImpl } from "./blob-store-impl.js";
import { formatBlobFileSize } from "./blob-utils.js";
export class ImageBlobServiceImpl {
  [key: string]: any;
  logger: BlobRuntime["logger"];
  blobStore!: Pick<BlobStoreImpl, "store" | "read">;
  deliveredImages: Map<string, string>;
  deliveredBlobIds: Set<string>;
  static MAX_VERSIONS_PER_SOURCE = 3;
  constructor(
    readonly runtime: BlobRuntime,
    dependencies: Record<string, any> = {},
  ) {
    this.logger = runtime.logger;
    Object.assign(this, dependencies);
    ((this.deliveredImages = new Map()), (this.deliveredBlobIds = new Set()));
  }
  init(): any {
    this.logger.setContext("ImageBlobService");
  }
  async storeFromDataUri(eA: any, el?: any, ec?: any): Promise<any> {
    let eu: any = eA.match(/^data:([^;]+);base64,(.+)$/s);
    if (!eu) throw Error("Invalid data URI format");
    let [, ed, ep] = eu;
    return this.blobStore.store(ep, ed, el, ec);
  }
  async storeFromFile(eA: any): Promise<any> {
    let el: any = (await (0, this.runtime.fs.readFile)(eA)).toString("base64"),
      ec: any = await this.runtime.imageUtils.getImageMimeTypeAsync(
        eA,
        this.runtime.fs.readFile,
      );
    return this.blobStore.store(el, ec, eA);
  }
  async rehydrate(eA: any): Promise<any> {
    let el: any = await this.blobStore.read(eA.blob_id, eA.mime);
    if (el) return `data:${eA.mime};base64,${el}`;
  }
  createPlaceholder(eA: any): any {
    let el: any = formatBlobFileSize(eA.size),
      ec: any = eA.original_filename || eA.source || "unknown";
    return `[Image from ${ec} (${eA.mime}, ${el}) - stored at: ${eA.blob_path}]`;
  }
  isImageBlobRef(eA: any): any {
    return (
      null !== eA &&
      "object" == typeof eA &&
      "image_blob_ref" === eA.type &&
      "string" == typeof eA.blob_id
    );
  }
  trackImageDelivered(eA: any, el?: any): any {
    if (el) {
      let ec: any = this.deliveredImages.get(el);
      return ec === eA
        ? "unchanged"
        : void 0 !== ec
          ? (this.deliveredImages.set(el, eA),
            this.deliveredBlobIds.add(eA),
            "new")
          : (this.deliveredImages.set(el, eA), this.deliveredBlobIds.has(eA))
            ? "duplicate"
            : (this.deliveredBlobIds.add(eA), "new");
    }
    return this.deliveredBlobIds.has(eA)
      ? "duplicate"
      : (this.deliveredBlobIds.add(eA), "new");
  }
  resetImageTracking(): any {
    (this.deliveredImages.clear(), this.deliveredBlobIds.clear());
  }
  async processHistoryForApi(eA: any, el: any): Promise<any> {
    let ec: any = 0,
      eu: any = 0;
    for (let ed: any = eA.length - 1; ed >= 0; ed--) {
      let ep: any = eA[ed];
      if ("message" === ep.type && "user" === ep.role && ++ec >= el) {
        eu = ed;
        break;
      }
    }
    let ed: any = !1;
    for (let el of eA)
      if (this.itemHasBlobRef(el)) {
        ed = !0;
        break;
      }
    if (!ed) return eA;
    let ep: any = this.buildRehydrateSet(eA, eu),
      eg: any = [];
    for (let el: any = 0; el < eA.length; el++) {
      let ec: any = eA[el];
      if (!this.itemHasBlobRef(ec)) {
        eg.push(ec);
        continue;
      }
      if (el < eu) {
        eg.push(this.dehydrateItem(ec));
        continue;
      }
      ep.has(el)
        ? eg.push(await this.rehydrateItem(ec))
        : eg.push(this.dehydrateItem(ec));
    }
    return eg;
  }
  buildRehydrateSet(eA: any, el: any): any {
    let ec: any = [];
    for (let eu: any = el; eu < eA.length; eu++) {
      let el: any = this.collectBlobRefs(eA[eu]);
      el.length > 0 && ec.push({ index: eu, refs: el });
    }
    let eu: any = new Map();
    for (let { index: eA, refs: el } of ec)
      for (let ec of el) eu.set(ec.blob_id, eA);
    let ep: any = ec.filter(({ index: eA, refs: el }: any) =>
        el.some((el: any) => eu.get(el.blob_id) === eA),
      ),
      eg: any = new Map(),
      eh: any = [];
    for (let { index: eA, refs: el } of ep) {
      let ec: any = new Set(el.map((eA: any) => eA.source).filter(Boolean));
      if (0 === ec.size) eh.push(eA);
      else
        for (let el of ec) (eg.has(el) || eg.set(el, []), eg.get(el).push(eA));
    }
    let ef: any = new Set();
    for (let eA of eh) ef.add(eA);
    for (let [, eA] of eg)
      for (let el of eA.slice(-ImageBlobServiceImpl.MAX_VERSIONS_PER_SOURCE))
        ef.add(el);
    return ef;
  }
  collectBlobRefs(eA: any): any {
    let el: any = [],
      ec: any = eA;
    if (
      "message" === ec.type &&
      "user" === ec.role &&
      Array.isArray(ec.content)
    )
      for (let eA of ec.content)
        if ("input_image" === eA.type && this.isImageBlobRef(eA.image)) {
          let ec: any = eA.image;
          el.push({ blob_id: ec.blob_id, source: ec.source });
        } else
          this.isImageBlobRef(eA) &&
            el.push({ blob_id: eA.blob_id, source: eA.source });
    if (ec.providerData?.toolResult?.content) {
      let eA: any = ec.providerData.toolResult.content;
      if (Array.isArray(eA))
        for (let ec of eA) {
          if (this.isImageBlobRef(ec)) {
            let eA: any = ec;
            el.push({ blob_id: eA.blob_id, source: eA.source });
          }
          if (ec?.type === "image_url" && ec.image_url?.url) {
            let eA: any = this.extractBlobRefFromUrl(ec.image_url.url);
            eA && el.push({ blob_id: eA.blob_id, source: eA.source });
          }
        }
      this.extractBlobRefsFromString("string" == typeof eA ? eA : "", el);
    }
    let eu: any =
      "string" == typeof ec.output
        ? ec.output
        : "string" == typeof ec.output?.text
          ? ec.output.text
          : "";
    return (eu && this.extractBlobRefsFromString(eu, el), el);
  }
  extractBlobRefsFromString(eA: any, el: any): any {
    let ec: any;
    if (!eA.includes("image_blob_ref")) return;
    let eu: any = /\{[^{}]*"type"\s*:\s*"image_blob_ref"[^{}]*\}/g;
    for (; null !== (ec = eu.exec(eA)); )
      try {
        let eA: any = JSON.parse(ec[0]);
        eA.blob_id && el.push({ blob_id: eA.blob_id, source: eA.source });
      } catch {
        let eA: any = ec[0].match(/"blob_id"\s*:\s*"([a-f0-9]{64})"/);
        eA && el.push({ blob_id: eA[1] });
      }
  }
  itemHasBlobRef(eA: any): any {
    let el: any = eA;
    if (
      "message" === el.type &&
      "user" === el.role &&
      Array.isArray(el.content)
    ) {
      for (let eA of el.content)
        if (
          ("input_image" === eA.type && this.isImageBlobRef(eA.image)) ||
          this.isImageBlobRef(eA)
        )
          return !0;
    }
    if (
      ("function_call_result" === el.type ||
        "function_call_output" === el.type) &&
      ("string" == typeof el.output
        ? el.output
        : "string" == typeof el.output?.text
          ? el.output.text
          : ""
      ).includes("image_blob_ref")
    )
      return !0;
    if (el.providerData?.toolResult?.content) {
      let eA: any = el.providerData.toolResult.content;
      if (
        ("string" == typeof eA ? eA : JSON.stringify(eA)).includes(
          "image_blob_ref",
        )
      )
        return !0;
    }
    return !1;
  }
  async rehydrateItem(eA: any): Promise<any> {
    let el: any = eA;
    if (
      "message" === el.type &&
      "user" === el.role &&
      Array.isArray(el.content)
    ) {
      let eA: any = [...el.content],
        ec: any = !1;
      for (let el: any = 0; el < eA.length; el++) {
        let eu: any = eA[el],
          ed: any =
            "input_image" === eu.type && this.isImageBlobRef(eu.image)
              ? eu.image
              : this.isImageBlobRef(eu)
                ? eu
                : void 0;
        if (ed) {
          let eu: any = await this.rehydrate(ed);
          (eu
            ? (eA[el] = {
                type: "input_image",
                image: eu,
                ...(ed.original_filename
                  ? { original_filename: ed.original_filename }
                  : {}),
              })
            : (eA[el] = {
                type: "input_text",
                text: this.createPlaceholder(ed),
              }),
            (ec = !0));
        }
      }
      if (ec) return { ...el, content: eA };
    }
    return "function_call_result" === el.type ||
      "function_call_output" === el.type
      ? this.rehydrateFunctionCallResult(el)
      : eA;
  }
  dehydrateItem(eA: any): any {
    let el: any = eA;
    if (
      "message" === el.type &&
      "user" === el.role &&
      Array.isArray(el.content)
    ) {
      let eA: any = [...el.content],
        ec: any = !1;
      for (let el: any = 0; el < eA.length; el++) {
        let eu: any = eA[el],
          ed: any =
            "input_image" === eu.type && this.isImageBlobRef(eu.image)
              ? eu.image
              : this.isImageBlobRef(eu)
                ? eu
                : void 0;
        ed &&
          ((eA[el] = { type: "input_text", text: this.createPlaceholder(ed) }),
          (ec = !0));
      }
      if (ec) return { ...el, content: eA };
    }
    return "function_call_result" === el.type ||
      "function_call_output" === el.type
      ? this.dehydrateFunctionCallResult(el)
      : eA;
  }
  async rehydrateFunctionCallResult(eA: any): Promise<any> {
    let el: any = !1,
      ec: any = { ...eA },
      eu: any =
        "string" == typeof ec.output
          ? ec.output
          : "string" == typeof ec.output?.text
            ? ec.output.text
            : "";
    if (eu.includes("image_blob_ref"))
      try {
        let eA: any = JSON.parse(eu),
          ed: any = await this.processContentArray(eA, "rehydrate");
        ed !== eA &&
          ("string" == typeof ec.output
            ? (ec.output = JSON.stringify(ed))
            : (ec.output = { ...ec.output, text: JSON.stringify(ed) }),
          (el = !0));
      } catch {}
    if (ec.providerData?.toolResult?.content) {
      let eA: any = ec.providerData.toolResult.content;
      if (Array.isArray(eA)) {
        let eu: any = await this.processContentArray(eA, "rehydrate");
        eu !== eA &&
          ((ec.providerData = {
            ...ec.providerData,
            toolResult: { ...ec.providerData.toolResult, content: eu },
          }),
          (el = !0));
      } else if ("string" == typeof eA && eA.includes("image_blob_ref"))
        try {
          let eu: any = JSON.parse(eA),
            ed: any = await this.processContentArray(eu, "rehydrate");
          ed !== eu &&
            ((ec.providerData = {
              ...ec.providerData,
              toolResult: {
                ...ec.providerData.toolResult,
                content: JSON.stringify(ed),
              },
            }),
            (el = !0));
        } catch {}
    }
    return el ? ec : eA;
  }
  dehydrateFunctionCallResult(eA: any): any {
    let el: any = !1,
      ec: any = { ...eA },
      eu: any =
        "string" == typeof ec.output
          ? ec.output
          : "string" == typeof ec.output?.text
            ? ec.output.text
            : "";
    if (eu.includes("image_blob_ref"))
      try {
        let eA: any = JSON.parse(eu),
          ed: any = this.processContentArraySync(eA, "dehydrate");
        ed !== eA &&
          ("string" == typeof ec.output
            ? (ec.output = JSON.stringify(ed))
            : (ec.output = { ...ec.output, text: JSON.stringify(ed) }),
          (el = !0));
      } catch {}
    if (ec.providerData?.toolResult?.content) {
      let eA: any = ec.providerData.toolResult.content;
      if (Array.isArray(eA)) {
        let eu: any = this.processContentArraySync(eA, "dehydrate");
        eu !== eA &&
          ((ec.providerData = {
            ...ec.providerData,
            toolResult: { ...ec.providerData.toolResult, content: eu },
          }),
          (el = !0));
      } else if ("string" == typeof eA && eA.includes("image_blob_ref"))
        try {
          let eu: any = JSON.parse(eA),
            ed: any = this.processContentArraySync(eu, "dehydrate");
          ed !== eu &&
            ((ec.providerData = {
              ...ec.providerData,
              toolResult: {
                ...ec.providerData.toolResult,
                content: JSON.stringify(ed),
              },
            }),
            (el = !0));
        } catch {}
    }
    return el ? ec : eA;
  }
  async processContentArray(eA: any, el: any): Promise<any> {
    if (Array.isArray(eA)) {
      let el: any = !1,
        ec: any = [...eA];
      for (let eA: any = 0; eA < ec.length; eA++) {
        let eu: any = ec[eA];
        if (
          eu &&
          "object" == typeof eu &&
          "image_url" === eu.type &&
          eu.image_url
        ) {
          let ed: any = this.extractBlobRefFromUrl(eu.image_url.url);
          if (ed) {
            let ep: any = await this.rehydrate(ed);
            (ep
              ? (ec[eA] = { ...eu, image_url: { ...eu.image_url, url: ep } })
              : (ec[eA] = { type: "text", text: this.createPlaceholder(ed) }),
              (el = !0));
          }
        } else if (
          eu &&
          "object" == typeof eu &&
          "image_blob_ref" === eu.type
        ) {
          let ed: any = await this.rehydrate(eu);
          (ed
            ? (ec[eA] = { type: "image_url", image_url: { url: ed } })
            : (ec[eA] = { type: "text", text: this.createPlaceholder(eu) }),
            (el = !0));
        }
      }
      return el ? ec : eA;
    }
    return eA;
  }
  processContentArraySync(eA: any, el: any): any {
    if (Array.isArray(eA)) {
      let el: any = !1,
        ec: any = [...eA];
      for (let eA: any = 0; eA < ec.length; eA++) {
        let eu: any = ec[eA];
        if (
          eu &&
          "object" == typeof eu &&
          "image_url" === eu.type &&
          eu.image_url
        ) {
          let ed: any = this.extractBlobRefFromUrl(eu.image_url.url);
          ed &&
            ((ec[eA] = { type: "text", text: this.createPlaceholder(ed) }),
            (el = !0));
        } else
          eu &&
            "object" == typeof eu &&
            "image_blob_ref" === eu.type &&
            ((ec[eA] = { type: "text", text: this.createPlaceholder(eu) }),
            (el = !0));
      }
      return el ? ec : eA;
    }
    return eA;
  }
  extractBlobRefFromUrl(eA: any): any {
    if (this.isImageBlobRef(eA)) return eA;
    if ("string" == typeof eA && eA.includes("image_blob_ref"))
      try {
        let el: any = JSON.parse(eA);
        if (this.isImageBlobRef(el)) return el;
      } catch {}
  }
}

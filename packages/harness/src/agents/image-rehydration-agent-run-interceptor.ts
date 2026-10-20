// Native codebuddy.js UTF-16 7111289..7113649; only DI construction and TS annotations changed.
const A_ = {
  AgentRunInterceptorPriority: {
    ImageFilter: 850,
    ImageRehydration: 1050,
    ImageCompression: 1075,
  },
};
export class ImageRehydrationAgentRunInterceptor {
  [key: string]: any;
  priority: number;
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = A_.AgentRunInterceptorPriority.ImageRehydration;
  }
  async intercept(eA: any): Promise<any> {
    if (!Array.isArray(eA.input)) return;
    if (
      (this.imageBlobService.resetImageTracking(),
      !eA.input.some((eA: any) => this.itemContainsBlobRef(eA)))
    )
      return void this.logger.debug(
        "[ImageRehydration] No blob refs found in input, skipping",
      );
    let el: any =
      (await this.settingsManager.get("imageHistoryRetainRounds")) ?? 2;
    for (let el of eA.input) {
      let eA: any = el;
      ("function_call_result" === eA.type ||
        "function_call_output" === eA.type) &&
        this.trackBlobRefsInItem(eA);
    }
    try {
      let ec: any = eA.input.length;
      eA.input = await this.imageBlobService.processHistoryForApi(eA.input, el);
      let eu: any = 0,
        ed: any = 0;
      for (let el of eA.input) {
        let eA: any = el;
        if (
          "function_call_result" === eA.type ||
          "function_call_output" === eA.type
        ) {
          let el: any = eA.providerData?.toolResult?.content;
          if (Array.isArray(el))
            for (let eA of el)
              ("image_url" === eA.type && eu++,
                ("text" === eA.type || "input_text" === eA.type) &&
                  "string" == typeof eA.text &&
                  eA.text.startsWith("[Image from") &&
                  ed++);
        }
      }
      this.logger.debug(
        "[ImageRehydration] Processed " +
          ec +
          " items, retainRounds=" +
          el +
          ", rehydrated=" +
          eu +
          ", placeholders=" +
          ed,
      );
    } catch (eA: any) {
      this.logger.warn(
        "[ImageRehydration] Failed to process image history:",
        eA,
      );
    }
  }
  trackBlobRefsInItem(eA: any): any {
    let el: any = eA.providerData?.toolResult?.content;
    if (Array.isArray(el))
      for (let eA of el)
        eA?.type === "image_blob_ref" &&
          eA.blob_id &&
          this.imageBlobService.trackImageDelivered(eA.blob_id, eA.source);
    let ec: any =
      "string" == typeof eA.output
        ? eA.output
        : "string" == typeof eA.output?.text
          ? eA.output.text
          : "";
    if (ec.includes("image_blob_ref")) {
      let eA: any,
        el: any = /\{[^{}]*"type"\s*:\s*"image_blob_ref"[^{}]*\}/g;
      for (; null !== (eA = el.exec(ec)); )
        try {
          let el: any = JSON.parse(eA[0]);
          el.blob_id &&
            this.imageBlobService.trackImageDelivered(el.blob_id, el.source);
        } catch {
          let el: any = eA[0].match(/"blob_id"\s*:\s*"([a-f0-9]{64})"/);
          el && this.imageBlobService.trackImageDelivered(el[1]);
        }
    }
  }
  itemContainsBlobRef(eA: any): any {
    if (
      "message" === eA.type &&
      "user" === eA.role &&
      Array.isArray(eA.content)
    ) {
      for (let el of eA.content)
        if (this.imageBlobService.isImageBlobRef(el)) return !0;
    }
    if (
      "function_call_output" === eA.type ||
      "function_call_result" === eA.type
    ) {
      if (Array.isArray(eA.providerData?.toolResult?.content)) {
        for (let el of eA.providerData.toolResult.content)
          if (this.imageBlobService.isImageBlobRef(el)) return !0;
      }
      if (
        ("string" == typeof eA.output
          ? eA.output
          : "string" == typeof eA.output?.text
            ? eA.output.text
            : ""
        ).includes('"image_blob_ref"')
      )
        return !0;
    }
    return !1;
  }
}

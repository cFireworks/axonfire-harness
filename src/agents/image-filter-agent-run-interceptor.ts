// Native codebuddy.js UTF-16 7127682..7129711; only DI construction and TS annotations changed.
const A_ = {
  AgentRunInterceptorPriority: {
    ImageFilter: 850,
    ImageRehydration: 1050,
    ImageCompression: 1075,
  },
};
export class ImageFilterAgentRunInterceptor {
  [key: string]: any;
  priority: number;
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = A_.AgentRunInterceptorPriority.ImageFilter;
  }
  async intercept(eA: any): Promise<any> {
    let el: any = eA.agent.model;
    if (!el) return;
    let ec: any = await this.productManager.waitConfiguration(),
      eu: any = ec.models?.find((eA: any) => eA.id === el);
    if (eu && !1 === eu.supportsImages) {
      if (Array.isArray(eA.input))
        for (let el of eA.input)
          "message" === el.type && "user" === el.role
            ? await this.filterImagesFromMessage(el)
            : "function_call_result" === el.type &&
              (await this.filterImagesFromFunctionCallResult(el));
      else if (
        eA.input &&
        "object" == typeof eA.input &&
        "history" in eA.input
      ) {
        let el: any = eA.input;
        if (Array.isArray(el.history))
          for (let eA of el.history)
            "message" === eA.type && "user" === eA.role
              ? await this.filterImagesFromMessage(eA)
              : "function_call_result" === eA.type &&
                (await this.filterImagesFromFunctionCallResult(eA));
      }
    }
  }
  async filterImagesFromMessage(eA: any): Promise<any> {
    if ("string" == typeof eA.content || !Array.isArray(eA.content)) return;
    let el: any = eA.content.length;
    ((eA.content = eA.content.filter((eA: any) => "input_image" !== eA.type)),
      eA.content.length < el &&
        this.logger.info(
          `Filtered ${el - eA.content.length} image(s) from user message (model does not support images)`,
        ));
  }
  async filterImagesFromFunctionCallResult(eA: any): Promise<any> {
    if (
      eA.output &&
      "object" == typeof eA.output &&
      null !== eA.output &&
      "text" in eA.output
    ) {
      let el: any = eA.output.text;
      if ("string" == typeof el) {
        let ec: any,
          eu: any = !1;
        try {
          ((ec = JSON.parse(el)), (eu = !0));
        } catch {
          return;
        }
        let ed: any = !1;
        if (Array.isArray(ec)) {
          let eA: any = ec.length;
          ((ec = ec.filter(
            (eA: any) =>
              "object" != typeof eA ||
              null === eA ||
              ("image" !== eA.type && "image_url" !== eA.type),
          )).length < eA &&
            (this.logger.info(
              `Filtered ${eA - ec.length} image(s) from function call result (model does not support images)`,
            ),
            (ed = !0)),
            0 === ec.length &&
              (ec = {
                type: "text",
                text: "[Image content filtered - current model does not support images]",
              }));
        } else
          "object" == typeof ec &&
            null !== ec &&
            ("image" === ec.type || "image_url" === ec.type) &&
            (this.logger.info(
              "Filtered image from function call result output (model does not support images)",
            ),
            (ec = {
              type: "text",
              text: "[Image content filtered - current model does not support images]",
            }),
            (ed = !0));
        ed && eu
          ? (eA.output.text = JSON.stringify(ec))
          : ed && (eA.output.text = ec);
      }
    }
  }
}

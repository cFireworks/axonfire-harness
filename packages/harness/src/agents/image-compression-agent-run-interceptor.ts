// Native codebuddy.js UTF-16 7114393..7115673; only DI construction and TS annotations changed.
const A_ = {
  AgentRunInterceptorPriority: {
    ImageFilter: 850,
    ImageRehydration: 1050,
    ImageCompression: 1075,
  },
};
export class ImageCompressionAgentRunInterceptor {
  [key: string]: any;
  priority: number;
  constructor(dependencies: Record<string, any> = {}) {
    Object.assign(this, dependencies);
    this.priority = A_.AgentRunInterceptorPriority.ImageCompression;
  }
  init(): any {
    this.logger.setContext("ImageCompressionInterceptor");
  }
  async intercept(eA: any): Promise<any> {
    if (Array.isArray(eA.input))
      try {
        for (let el of eA.input)
          "message" === el.type &&
            "user" === el.role &&
            (await this.compressImagesInMessage(el));
      } catch (eA: any) {
        this.logger.warn(
          `Unexpected error during image compression, skipping: ${eA}`,
        );
      }
  }
  async compressImagesInMessage(eA: any): Promise<any> {
    let el: any = eA.content;
    if (Array.isArray(el))
      for (let eA: any = 0; eA < el.length; eA++) {
        let ec: any = el[eA];
        if (
          "input_image" === ec.type &&
          "string" == typeof ec.image &&
          ec.image.startsWith("data:")
        ) {
          this.logger.info(
            `Found input_image (${ec.image.length} chars data URI), compressing...`,
          );
          let eu: any = await this.compressInputImageBlock(ec);
          eu && (el[eA] = eu);
        }
      }
  }
  async compressInputImageBlock(eA: any): Promise<any> {
    try {
      let el: any = eA.image,
        ec: any = this.imageUtils.getImageCompressionMaxDimension(),
        eu: any = await this.imageUtils.compressImage(el, ec);
      if (eu === el)
        return void this.logger.info(
          `Image already within dimension limit (maxDimension=${ec}), no compression needed`,
        );
      return (
        this.logger.info(
          `Compression successful (maxDimension=${ec}): ${el.length} -> ${eu.length} chars (saved ${((1 - eu.length / el.length) * 100).toFixed(1)}%)`,
        ),
        { ...eA, image: eu }
      );
    } catch (eA: any) {
      this.logger.warn(`Failed to compress image, using original: ${eA}`);
      return;
    }
  }
}

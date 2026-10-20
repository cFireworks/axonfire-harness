import * as n4 from "node:path";
import * as ok from "node:fs/promises";
import * as nC from "./media-types.js";
import * as iq from "./media-types.js";
import { MediaRuntime } from "./media-runtime.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { imageGenParameters as cC } from "./media-schemas.js";
import type { ToolManager } from "../tools/tool-manager.js";
const nq = {
  ProductFeature: {
    ImageGen: "ImageGen",
    ImageEdit: "ImageEdit",
    VideoGen: "VideoGen",
  },
};
// extracted from codebuddy.js bytes 12001889..12004324; search term: "this.name=nC.ToolNames.IMAGE_GEN"
export class ImageGenTool {
  name: any;
  description: any;
  parameters: any;
  isEnabled: any;

  constructor(
    readonly runtime: MediaRuntime,
    readonly imageService: any,
    readonly videoService?: any,
  ) {
    ((this.name = nC.ToolNames.IMAGE_GEN),
      (this.description =
        "Generate images from text descriptions using AI models."),
      (this.parameters = cC),
      (this.isEnabled = async (eA: any) => {
        let el: any = this.runtime.env[iq.ENV_KEY_CODEBUDDY_IMAGE_GEN_ENABLED];
        if (void 0 !== el) return "true" === el || "1" === el;
        let ec: any = await this.runtime.configuration();
        if (!ec.productFeatures?.[nq.ProductFeature.ImageGen]) return !1;
        let eu: any =
            this.imageService.getModelsByTag(ec, nC.TEXT_TO_IMAGE_MODEL_TAG)
              .length > 0,
          ed: any =
            this.imageService.getModelsByTag(ec, nC.IMAGE_TO_IMAGE_MODEL_TAG)
              .length > 0;
        return eu || ed;
      }));
  }
  async execute(eA: any, el: any): Promise<any> {
    if (
      (await this.imageService.initializeOutputDir(eA.output_dir),
      !eA.prompt?.trim())
    )
      return {
        content: "Error: prompt parameter is required",
        error: "Missing prompt",
      };
    try {
      let ec: any,
        eu: any = el.context.abortSignal;
      if (eA.image && eA.image.length > 0) {
        let ed: any = await this.runtime.configuration();
        if (
          !(
            this.imageService.getModelsByTag(ed, nC.IMAGE_TO_IMAGE_MODEL_TAG)
              .length > 0
          )
        )
          return {
            content:
              "Error: Image-to-image capability is not available in the current configuration.",
            error: "Image-to-image not available",
          };
        let ep: any = [];
        for (let el of eA.image) {
          if (!el?.trim())
            return {
              content: "Error: each image entry must be a non-empty string",
              error: "Empty image entry",
            };
          let eA: any = await this.imageService.processImageInput(el, eu);
          ep.push(eA);
        }
        ec = await this.imageService.editImage(
          {
            prompt: eA.prompt,
            size: eA.size,
            quality: eA.quality,
            style: eA.style,
            background: eA.background,
            footnote: eA.footnote,
            revise: eA.revise,
            image: ep,
            input_fidelity: eA.input_fidelity,
          },
          el,
        );
      } else
        ec = await this.imageService.generateImage(
          {
            prompt: eA.prompt,
            size: eA.size,
            quality: eA.quality,
            style: eA.style,
            background: eA.background,
            footnote: eA.footnote,
            revise: eA.revise,
          },
          el,
        );
      let ed: any = ec.map((eA: any) => ({ localPath: eA })),
        ep: any = {
          type: "image_gen_tool_result",
          prompt: eA.prompt,
          status: "completed",
          images: ed,
        },
        eg: any =
          1 === ec.length
            ? `Image saved to: ${this.runtime.createFileHyperlink(ec[0])}

Full path: ${ec[0]}`
            : `Images saved to:
${ec.map((eA: any, el: any) => `${el + 1}. ${this.runtime.createFileHyperlink(eA)}`).join("\n")}`;
      return {
        title:
          1 === ec.length
            ? "Image generated successfully"
            : `${ec.length} images generated successfully`,
        content: JSON.stringify(ep),
        renderer: { type: "text", value: eg },
        rawResponse: ep,
      };
    } catch (ec: any) {
      let eA: any = this.imageService.extractErrorMessage(ec),
        el: any = ec?.response?.data;
      return (
        this.runtime.logger.error(
          `Image generation failed: ${eA}${el ? `, response: ${JSON.stringify(el)}` : ""}`,
        ),
        { content: `Error: ${eA}`, error: eA }
      );
    }
  }

  register(tools: ToolManager): void {
    tools.register(this.name, {
      parameters: zodToJsonSchema(this.parameters as any),
      parseInput: false,
      isEnabled: (session) => this.isEnabled(session),
      execute: (input, context) => this.execute(input, context),
    });
  }
}

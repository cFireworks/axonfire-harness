import * as n4 from "node:path";
import * as ok from "node:fs/promises";
import * as nC from "./media-types.js";
import * as iq from "./media-types.js";
import { MediaRuntime } from "./media-runtime.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { imageEditParameters as cS } from "./media-schemas.js";
import type { ToolManager } from "../tools/tool-manager.js";
const nq = {
  ProductFeature: {
    ImageGen: "ImageGen",
    ImageEdit: "ImageEdit",
    VideoGen: "VideoGen",
  },
};
// extracted from codebuddy.js bytes 12021234..12023170; search term: "this.name=nC.ToolNames.IMAGE_EDIT"
export class ImageEditTool {
  name: any;
  description: any;
  parameters: any;
  isEnabled: any;

  constructor(
    readonly runtime: MediaRuntime,
    readonly imageService: any,
    readonly videoService?: any,
  ) {
    ((this.name = nC.ToolNames.IMAGE_EDIT),
      (this.description =
        "Edit or modify an existing image using AI models. Use this tool when you have an image and want to transform it based on text instructions (e.g., style transfer, add elements, modify colors, etc.)."),
      (this.parameters = cS),
      (this.isEnabled = async (eA: any) => {
        let el: any = this.runtime.env[iq.ENV_KEY_CODEBUDDY_IMAGE_EDIT_ENABLED];
        if (void 0 !== el) return "true" === el || "1" === el;
        let ec: any = await this.runtime.configuration();
        return (
          !!ec.productFeatures?.[nq.ProductFeature.ImageEdit] &&
          this.imageService.getModelsByTag(ec, nC.IMAGE_TO_IMAGE_MODEL_TAG)
            .length > 0
        );
      }));
  }
  async execute(eA: any, el: any): Promise<any> {
    if (
      (await this.imageService.initializeOutputDir(eA.output_dir),
      !eA.image?.trim())
    )
      return {
        content: "Error: image parameter is required",
        error: "Missing image",
      };
    if (!eA.prompt?.trim())
      return {
        content: "Error: prompt parameter is required",
        error: "Missing prompt",
      };
    try {
      let ec: any = await this.imageService.processImageInput(
          eA.image,
          el.context.abortSignal,
        ),
        eu: any = await this.imageService.editImage(
          {
            image: [ec],
            prompt: eA.prompt,
            size: eA.size,
            quality: eA.quality,
            style: eA.style,
            background: eA.background,
            footnote: eA.footnote,
            revise: eA.revise,
            input_fidelity: eA.input_fidelity,
          },
          el,
        ),
        ed: any = eu.map((eA: any) => ({ localPath: eA })),
        ep: any = {
          type: "image_gen_tool_result",
          prompt: eA.prompt,
          status: "completed",
          images: ed,
        },
        eg: any =
          1 === eu.length
            ? `Edited image saved to: ${this.runtime.createFileHyperlink(eu[0])}

Full path: ${eu[0]}`
            : `Edited images saved to:
${eu.map((eA: any, el: any) => `${el + 1}. ${this.runtime.createFileHyperlink(eA)}`).join("\n")}`;
      return {
        title:
          1 === eu.length
            ? "Image edited successfully"
            : `${eu.length} images edited successfully`,
        content: JSON.stringify(ep),
        renderer: { type: "text", value: eg },
        rawResponse: ep,
      };
    } catch (ec: any) {
      let eA: any = this.imageService.extractErrorMessage(ec),
        el: any = ec?.response?.data;
      return (
        this.runtime.logger.error(
          `Image editing failed: ${eA}${el ? `, response: ${JSON.stringify(el)}` : ""}`,
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

import * as n4 from "node:path";
import * as ok from "node:fs/promises";
import * as nC from "./media-types.js";
import * as iq from "./media-types.js";
import { MediaRuntime } from "./media-runtime.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { videoGenParameters as cT } from "./media-schemas.js";
import type { ToolManager } from "../tools/tool-manager.js";
const nq = {
  ProductFeature: {
    ImageGen: "ImageGen",
    ImageEdit: "ImageEdit",
    VideoGen: "VideoGen",
  },
};
// extracted from codebuddy.js bytes 12033776..12035596; search term: "this.name=nC.ToolNames.VIDEO_GEN"
export class VideoGenTool {
  name: any;
  description: any;
  parameters: any;
  isEnabled: any;

  constructor(
    readonly runtime: MediaRuntime,
    readonly imageService: any,
    readonly videoService?: any,
  ) {
    ((this.name = nC.ToolNames.VIDEO_GEN),
      (this.description =
        "Generates short videos from text descriptions or input images and saves them locally as MP4 files."),
      (this.parameters = cT),
      (this.isEnabled = async (eA: any) => {
        let el: any = this.runtime.env[iq.ENV_KEY_CODEBUDDY_VIDEO_GEN_ENABLED];
        if (void 0 !== el) return "true" === el || "1" === el;
        let ec: any = await this.runtime.configuration();
        return ec.productFeatures?.[nq.ProductFeature.VideoGen] ?? !1;
      }));
  }
  async execute(eA: any, el: any): Promise<any> {
    if (
      (await this.videoService.initializeOutputDir(eA.output_dir),
      !eA.prompt?.trim())
    )
      return {
        content: "Error: prompt parameter is required",
        error: "Missing prompt",
      };
    try {
      let ec: any, eu: any;
      (this.runtime.logger.info(
        `[VideoGen] Generating video for prompt: "${eA.prompt.substring(0, 50)}..."${eA.image ? " (image-to-video)" : ""}`,
      ),
        eA.image &&
          (ec = await this.imageService.processImageInput(
            eA.image,
            el.context.abortSignal,
          )),
        eA.last_image &&
          (eu = await this.imageService.processImageInput(
            eA.last_image,
            el.context.abortSignal,
          )));
      let ed: any = await this.videoService.generateVideo(
          {
            prompt: eA.prompt,
            image: ec,
            last_image: eu,
            seconds: eA.seconds,
            resolution: eA.resolution,
          },
          el,
        ),
        ep: any = ed.map((eA: any) => ({ localPath: eA })),
        eg: any = ec ? "image-to-video" : "text-to-video",
        eh: any = {
          type: "video_gen_tool_result",
          mode: eg,
          prompt: eA.prompt,
          status: "completed",
          videos: ep,
        },
        ef: any =
          1 === ed.length
            ? `Video saved to: ${this.runtime.createFileHyperlink(ed[0])}

Full path: ${ed[0]}`
            : `Videos saved to:
${ed.map((eA: any, el: any) => `${el + 1}. ${this.runtime.createFileHyperlink(eA)}`).join("\n")}`;
      return {
        title:
          1 === ed.length
            ? "Video generated successfully"
            : `${ed.length} videos generated successfully`,
        content: JSON.stringify(eh),
        renderer: { type: "text", value: ef },
        rawResponse: eh,
      };
    } catch (el: any) {
      let eA: any = el instanceof Error ? el.message : String(el);
      return (
        this.runtime.logger.error(`[VideoGen] Video generation failed: ${eA}`),
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

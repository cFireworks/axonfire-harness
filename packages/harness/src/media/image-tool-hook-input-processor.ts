import {
  TEXT_TO_IMAGE_MODEL_TAG,
  IMAGE_TO_IMAGE_MODEL_TAG,
} from "./media-types.js";
/** Native 8506428-era PostToolUse input processor. Full Hook pipeline is not
 * implied by exporting this class. ImageGen+image still uses the text model tag. */
export class ImageToolHookInputProcessor {
  readonly priority = 100;
  constructor(
    readonly imageService: {
      resolveModel(session: any, tag: string): Promise<any>;
    },
    readonly logger: { warn(...args: any[]): void } = { warn() {} },
  ) {}
  async process(input: any, event: string): Promise<void> {
    if (event !== "PostToolUse") return;
    const tool = input.tool_name;
    if (tool === "ImageGen" || tool === "ImageEdit")
      try {
        const tag =
            tool === "ImageGen"
              ? TEXT_TO_IMAGE_MODEL_TAG
              : IMAGE_TO_IMAGE_MODEL_TAG,
          model = await this.imageService.resolveModel(
            input.session ?? undefined,
            tag,
          );
        if (input.tool_input && model) input.tool_input.image_model = model;
      } catch (error) {
        this.logger.warn(
          "Failed to resolve image model for hook input:",
          error,
        );
      }
  }
}

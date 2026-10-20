import { z } from "zod3";
// Public native names are retained alongside descriptive reconstruction names.
export const baseImageParameters = z.object({
  prompt: z.string().describe("The text description of the image"),
  size: z
    .string()
    .optional()
    .describe(
      'Image size in pixels, e.g. "1024x1024", "1024x1536", "1536x1024"',
    ),
  quality: z.string().optional().describe("Quality: low, medium, high"),
  style: z.string().optional().describe("Image style"),
  background: z.string().optional().describe("Background: transparent, opaque"),
  footnote: z
    .string()
    .optional()
    .describe("Watermark, max 16 characters (Hunyuan)"),
  revise: z
    .boolean()
    .optional()
    .describe("Whether to revise the prompt (Hunyuan)"),
  output_dir: z
    .string()
    .optional()
    .describe(
      "Custom output directory path, defaults to generated-images directory in workspace if not specified",
    ),
});
export const imageEditExtendParameters = z.object({
  image: z
    .string()
    .describe(
      'The input image to edit. Supports: (1) local file path like "/path/to/image.png", (2) HTTP/HTTPS URL like "https://example.com/image.png".',
    ),
  input_fidelity: z
    .string()
    .optional()
    .describe(
      "Control the degree of style matching to the input image. Higher values produce results closer to the original.",
    ),
});
export const imageGenParameters = baseImageParameters.extend({
  image: z
    .array(z.string())
    .min(1)
    .max(3)
    .optional()
    .describe(
      'Optional input images for image-to-image editing, accepts 1-3 images. Each entry supports: (1) local file path like "/path/to/image.png", (2) HTTP/HTTPS URL like "https://example.com/image.png".',
    ),
  input_fidelity: z
    .string()
    .optional()
    .describe(
      "Control the degree of style matching to the input image (image-to-image only). Higher values produce results closer to the original.",
    ),
});
export const imageEditParameters = baseImageParameters.merge(
  imageEditExtendParameters,
);
export {
  baseImageParameters as BaseImageParameters,
  imageEditExtendParameters as ImageEditExtendParameters,
};
export const videoGenParameters = z.object({
  prompt: z
    .string()
    .describe(
      "Text description of the video to generate. Be specific about scenes, actions, camera movements, and visual style for better results.",
    ),
  image: z
    .string()
    .optional()
    .describe(
      'Optional input image for image-to-video. Supports: (1) local file path like "/path/to/image.png", (2) HTTP/HTTPS URL like "https://example.com/image.png".',
    ),
  last_image: z
    .string()
    .optional()
    .describe(
      "Optional last-frame image for image-to-video (frame interpolation between image and last_image). Same format as image.",
    ),
  seconds: z.coerce
    .number()
    .optional()
    .describe("Video duration in seconds, default 5"),
  resolution: z
    .enum(["720P", "1080P"])
    .optional()
    .describe(
      'Video resolution. Only "720P" (default) and "1080P" are supported; do not pass any other value.',
    ),
  output_dir: z
    .string()
    .optional()
    .describe(
      'Custom output directory path for saving videos. Defaults to "generated-videos" directory in workspace if not specified.',
    ),
});

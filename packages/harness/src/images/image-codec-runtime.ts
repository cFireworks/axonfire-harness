import Jimp from "jimp";
export type ImageCodecRuntime = {
  codec: any;
  env: NodeJS.ProcessEnv;
  logger: { warn(message: string): void };
};
export function createImageCodecRuntime(
  overrides: Partial<ImageCodecRuntime> = {},
): ImageCodecRuntime {
  return { codec: Jimp, env: process.env, logger: { warn() {} }, ...overrides };
}

import * as fs from "node:fs/promises";
import type { NativeImageUtils } from "./native-image-utils.js";
export const ReadImageErrorCode = {
  ReadFilePathError: "1003",
  ReadFileNotFoundError: "1001",
  ReadFilePermissionError: "1002",
  ReadFileModelNoImageSupportError: "1010",
  ReadFileImageTooLargeError: "1011",
};
export class ReadImageExecutionError extends Error {
  constructor(
    message: string,
    readonly toolErrorCode: string,
  ) {
    super(message);
    this.name = "ToolExecutionError";
  }
}
export type ReadImageRuntime = {
  imageUtils: NativeImageUtils;
  fs: Pick<typeof fs, "access" | "stat" | "readFile">;
  getCurrentModel(
    session?: any,
  ): Promise<{ id?: string; supportsImages?: boolean } | undefined>;
  isBinaryFile(path: string): Promise<boolean>;
  buildDirectoryErrorMessage(path: string): Promise<string>;
};
// Native FileUtils binary probe; not an extension-only substitute.
export async function isBinaryImageFile(path: string): Promise<boolean> {
  try {
    const buffer = Buffer.alloc(1024),
      file = await fs.open(path, "r"),
      { bytesRead } = await file.read(buffer, 0, 1024, 0);
    await file.close();
    let zero = 0,
      control = 0;
    for (let index = 0; index < bytesRead; index++) {
      const byte = buffer[index]!;
      if (byte === 0) zero++;
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) control++;
    }
    return zero > 0 || control / bytesRead > 0.3;
  } catch {
    return false;
  }
}

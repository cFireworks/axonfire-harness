// Original Read image methods; explicit filesystem/model/blob/codec adapters.
import * as path from "node:path";
import { formatBlobFileSize } from "../blobs/blob-utils.js";
import {
  ReadImageExecutionError,
  ReadImageErrorCode,
} from "./read-image-runtime.js";
export class NativeReadImageTool {
  [key: string]: any;
  constructor(dependencies: Record<string, any>) {
    Object.assign(this, dependencies);
  }
  async isImageFile(eA: any, el: any): Promise<any> {
    try {
      let ec: any = await this.runtime.getCurrentModel(el),
        eu: any = ec?.id;
      if (!this.runtime.imageUtils.isImageSupportedByModel(eA, eu)) return !1;
      return await this.runtime.isBinaryFile(eA);
    } catch {
      return !1;
    }
  }
  async readImageFile(eA: any, el: any = 2e3): Promise<any> {
    try {
      let ec: any, eu: any;
      await (0, this.runtime.fs.access)(eA);
      let ed: any = await (0, this.runtime.fs.stat)(eA);
      if ((this.readFileStateService.readFile(eA, ed), !ed.isFile())) {
        let el: any = await this.runtime.buildDirectoryErrorMessage(eA);
        throw new ReadImageExecutionError(
          el,
          ReadImageErrorCode.ReadFilePathError,
        );
      }
      let ep: any = (await (0, this.runtime.fs.readFile)(eA)).toString(
          "base64",
        ),
        eg: any = await this.runtime.imageUtils.getImageMimeTypeAsync(
          eA,
          this.runtime.fs.readFile,
        );
      try {
        ec = await this.imageBlobService.storeFromFile(eA);
      } catch (eA: any) {
        this.logger.warn("Failed to store image in blob store:", eA);
      }
      let eh: any = path.basename(eA),
        ef: any = formatBlobFileSize(ed.size);
      if (ec) {
        let el: any = this.imageBlobService.trackImageDelivered(ec.blob_id, eA);
        if ("unchanged" === el) {
          let el: any = `[Image unchanged] The file "${path.basename(eA)}" has the same content as when it was previously read (${ec.mime}, ${formatBlobFileSize(ec.size)}). The image has NOT changed since the last read.`;
          return {
            title: `Read image ${String(eh)}${ef ? ` (${ef})` : ""}`,
            content: el,
            renderer: { type: "text" },
          };
        }
        if ("duplicate" === el) {
          let el: any = `[Image reference] Same image content as previously loaded from a different path (${ec.mime}, ${formatBlobFileSize(ec.size)}, source: ${ec.source || eA}). Content is identical to the earlier Read result.`;
          return {
            title: `Read image ${String(eh)}${ef ? ` (${ef})` : ""}`,
            content: el,
            renderer: { type: "text" },
          };
        }
      }
      let em: any = `data:${eg};base64,${ep}`;
      if (el > 0) {
        let ec: any = await this.runtime.imageUtils.compressUserImage(em, el);
        if (!ec)
          return (
            this.logger.warn(
              `Image too large after compression, discarded: ${eA}`,
            ),
            {
              title: `Read image ${String(eh)}${ef ? ` (${ef})` : ""}`,
              content:
                this.runtime.imageUtils
                  .IMAGE_TOO_LARGE_AFTER_COMPRESSION_PLACEHOLDER,
              renderer: { type: "text" },
              rawResponse: {
                is_error: !0,
                tool_error_code: ReadImageErrorCode.ReadFileImageTooLargeError,
              },
            }
          );
        let ed: any = ec.split(",")[1];
        if (ed.length < ep.length) {
          let ec: any = Math.round((3 * ed.length) / 4);
          ((eu = formatBlobFileSize(ec)),
            this.logger.info(
              `Image compression applied for Read tool: ${eh} (${ef} -> ${eu}), maxDimension=${el}, path=${eA}`,
            ));
        }
        em = ec;
      }
      let eE: any = "";
      return (
        eu && ef
          ? (eE = ` (${ef} → ${eu}, compressed)`)
          : ef && (eE = ` (${ef})`),
        {
          title: `Read image ${String(eh)}${eE}`,
          content: JSON.stringify([
            { type: "image_url", image_url: { url: em } },
          ]),
          renderer: { type: "text" },
        }
      );
    } catch (eA: any) {
      if (eA instanceof Error && "code" in eA) {
        let el: any = eA;
        if ("ENOENT" === el.code)
          throw new ReadImageExecutionError(
            "<tool_use_error>Image file does not exist.</tool_use_error>",
            ReadImageErrorCode.ReadFileNotFoundError,
          );
        if ("EACCES" === el.code)
          throw new ReadImageExecutionError(
            "Permission denied.",
            ReadImageErrorCode.ReadFilePermissionError,
          );
      }
      throw eA;
    }
  }
}

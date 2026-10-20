// codebuddy.js UTF-16 7355182..7356920; native methods with explicit I/O boundary.
import * as path from "node:path";
import type { BlobRuntime } from "./blob-runtime.js";
const em = 50,
  eE = 2048;
export class ToolResultBlobServiceImpl {
  [key: string]: any;
  logger: BlobRuntime["logger"];
  thresholdBytes!: number;
  constructor(
    readonly runtime: BlobRuntime,
    dependencies: Record<string, any> = {},
  ) {
    this.logger = runtime.logger;
    Object.assign(this, dependencies);
  }
  init(): any {
    this.logger.setContext("ToolResultBlobService");
    let eA: any = this.runtime.env.CODEBUDDY_TOOL_RESULT_THRESHOLD_KB,
      el: any = eA ? parseInt(eA, 10) : em;
    this.thresholdBytes = 1024 * el;
  }
  shouldExternalize(eA: any): any {
    return eA.length > this.thresholdBytes;
  }
  async externalize(eA: any, el: any, ec: any, eu?: any): Promise<any> {
    let ed: any = this.getSessionToolResultDir(ec, eu);
    await this.runtime.fs.mkdir(ed, { recursive: !0 });
    let eh: any = `${eA}.txt`,
      ef: any = path.join(ed, eh);
    await this.runtime.fs.writeFile(ef, el, "utf-8");
    let em: any = (el.length / 1024).toFixed(1),
      eC: any = el.length > eE ? el.substring(0, eE) + "\n..." : el,
      ey: any = [
        "<persisted-output>",
        `Output too large (${em}KB). Full output saved to: ${ef}`,
        "",
        `Preview (first ${Math.min(el.length, eE)} bytes):`,
        eC,
        "</persisted-output>",
      ].join("\n");
    return (
      this.logger.info(`Externalized tool result for ${eA}: ${em}KB -> ${ef}`),
      ey
    );
  }
  async read(eA: any): Promise<any> {
    try {
      return await this.runtime.fs.readFile(eA, "utf-8");
    } catch {
      this.logger.warn(`Tool result file not found: ${eA}`);
      return;
    }
  }
  getSpillFilePath(eA: any, el: any, ec: any): any {
    let eu: any = this.getSessionToolResultDir(el, ec);
    return path.join(eu, `${eA}.txt`);
  }
  externalizeFromSpillFile(eA: any, el: any, ec: any, eu: any): any {
    let ed: any = (el / 1024).toFixed(1),
      ep: any = eu.length > eE ? eu.substring(0, eE) + "\n..." : eu,
      eg: any = [
        "<persisted-output>",
        `Output too large (${ed}KB). Full output saved to: ${ec}`,
        "",
        `Preview (first ${Math.min(eu.length, eE)} bytes):`,
        ep,
        "</persisted-output>",
      ].join("\n");
    return (
      this.logger.info(
        `Externalized tool result (from spill) for ${eA}: ${ed}KB -> ${ec}`,
      ),
      eg
    );
  }
  async cleanupSession(eA: any, el: any): Promise<any> {
    let ec: any = this.getSessionToolResultDir(eA, el);
    try {
      (await this.runtime.fs.rm(ec, { recursive: !0, force: !0 }),
        this.logger.info(`Cleaned up tool results for session ${eA}`));
    } catch {}
  }
  getSessionToolResultDir(eA: any, el: any): any {
    return el && eA.startsWith("agent-")
      ? path.join(
          this.runtime.paths.getHomeProjectDir(),
          el,
          "subagents",
          eA,
          "tool-results",
        )
      : path.join(this.runtime.paths.getHomeProjectDir(), eA, "tool-results");
  }
}

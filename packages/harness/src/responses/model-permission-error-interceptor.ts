// Native UTF-16 11130150..11131571; method bodies + explicit DI.
import * as rB from "node:path";
import { CompactType } from "../context/compact-config.js";
import { TRUNCATION_RETRY_MARKER } from "../runner/history-repair.js";
import {
  NativeResponseInterceptor,
  MediaContentErrorType as tk,
  TEXTUAL_TOOL_CALL_RETRY_MARKER as rS,
} from "./response-interceptor-runtime.js";
const r_ = { TRUNCATION_RETRY_MARKER },
  rM = 11136;
export class ModelPermissionErrorInterceptor extends NativeResponseInterceptor {
  async intercept(eA: any): Promise<any> {
    if (this.extractErrorCode(eA.result) === rM) {
      this.logger.info(
        "[ModelPermissionErrorInterceptor] Detected model permission error (code 11136), forcing product configuration refresh",
      );
      try {
        (await this.productManager.sync(!0),
          await this.appendRefreshedModelList(eA),
          this.logger.info(
            "[ModelPermissionErrorInterceptor] Product configuration refreshed successfully",
          ));
      } catch (eA: any) {
        this.logger.warn(
          "[ModelPermissionErrorInterceptor] Failed to refresh product configuration:",
          eA,
        );
      }
    }
  }
  extractErrorCode(eA: any): any {
    let el: any = eA?.error?.error;
    if (el) {
      if ("number" == typeof el.code && el.code > 0) return el.code;
      if ("string" == typeof el.message) {
        let eA: any = this.extractCodeFromMessage(el.message);
        if (void 0 !== eA) return eA;
      }
    }
    let ec: any = eA?.error;
    if (ec && "number" == typeof ec.code && ec.code > 0) return ec.code;
  }
  extractCodeFromMessage(eA: any): any {
    try {
      let el: any = JSON.parse(eA),
        ec: any = el?.error?.code ?? el?.code;
      if ("number" == typeof ec) return ec;
    } catch {}
  }
  async appendRefreshedModelList(eA: any): Promise<any> {
    try {
      let el: any = this.runtime.getAgentManager(),
        ec: any = await el.getDefault(),
        eu: any = await el.getModels(ec.name);
      if (0 === eu.length) return;
      let ed: any = eu.map((eA: any) => `  - ${eA.id}`).join("\n"),
        ep: any = `

Available models after refresh:
${ed}

Please use --model <model_id> or /model to switch to a valid model.`,
        eg: any = eA.result?.error?.error;
      eg && "string" == typeof eg.message && (eg.message = eg.message + ep);
    } catch (eA: any) {
      this.logger.warn(
        "[ModelPermissionErrorInterceptor] Failed to append refreshed model list:",
        eA,
      );
    }
  }
}

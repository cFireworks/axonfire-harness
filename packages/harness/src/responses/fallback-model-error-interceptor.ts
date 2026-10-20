// Native UTF-16 11127506..11129255; method bodies + explicit DI.
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
export class FallbackModelErrorInterceptor extends NativeResponseInterceptor {
  async intercept(eA: any): Promise<any> {
    let el: any = eA.session,
      ec: any = el.options?.fallbackModel?.trim();
    if (!el.options?.print || !ec) return;
    let eu: any = eA.result?.lastAgent?.model || el.options?.model;
    if (eu && eu === ec)
      return void this.logger.warn(
        `[FallbackModelErrorInterceptor] fallback model is same as current model (${ec}), skipping`,
      );
    if (el.meta?.fallbackModelActivated)
      return void this.logger.warn(
        "[FallbackModelErrorInterceptor] fallback already activated, skipping",
      );
    if (
      !this.runtime.utilities.ErrorUtils.isModelOverloadedError(
        eA.result?.error,
      )
    )
      return;
    el.meta = el.meta || {};
    let ed: any = this.runtime.utilities.ErrorUtils.isQuotaExhaustedError(
        eA.result?.error,
      ),
      ep: any = !!el.meta.fallbackModelPrimaryRetryAttempted;
    if (!ed && !ep) {
      ((el.meta.fallbackModelPrimaryRetryAttempted = !0),
        this.logger.warn(
          `[FallbackModelErrorInterceptor] primary model overloaded, retrying once with primary model (${eu || "default"}), session=${el.id}`,
        ));
      let eA: any =
        '<system-reminder data-role="error-recovery">Primary model is temporarily overloaded. Retrying once with the same model before fallback.</system-reminder>';
      return (
        await this.runtime
          .getAgentService()
          .runDefault(
            this.runtime.utilities.InputItemUtils.createErrorRecoveryInput(eA),
            { context: el, bypassMessageQueue: !0 },
          ),
        !0
      );
    }
    ((el.meta.fallbackModelActivated = !0),
      (el.meta.fallbackModelFrom = eu || ""),
      (el.meta.fallbackModelTo = ec),
      (el.options.model = ec),
      this.logger.warn(
        `[FallbackModelErrorInterceptor] trigger fallback model switch: ${eu || "default"} -> ${ec}, session=${el.id}, quotaExhausted=${ed}`,
      ));
    let eg: any = `<system-reminder data-role="error-recovery">Primary model is temporarily unavailable. Automatically switched to fallback model \`${ec}\` and retrying now.</system-reminder>`;
    return (
      await this.runtime
        .getAgentService()
        .runDefault(
          this.runtime.utilities.InputItemUtils.createErrorRecoveryInput(eg),
          { context: el, bypassMessageQueue: !0 },
        ),
      !0
    );
  }
}

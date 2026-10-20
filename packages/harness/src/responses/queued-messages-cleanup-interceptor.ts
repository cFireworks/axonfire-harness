// Native UTF-16 11112796..11113108; method bodies + explicit DI.
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
export class QueuedMessagesCleanupInterceptor extends NativeResponseInterceptor {
  async intercept(eA: any): Promise<any> {
    if (
      eA.session.queuedMessagesRecord &&
      eA.session.queuedMessagesRecord.size > 0
    ) {
      let el: any = eA.session.queuedMessagesRecord.size;
      (eA.session.queuedMessagesRecord.clear(),
        this.logger.debug(
          `[QueuedMessagesCleanupInterceptor] Cleared ${el} queued messages records from session ${eA.session.id}`,
        ));
    }
  }
}

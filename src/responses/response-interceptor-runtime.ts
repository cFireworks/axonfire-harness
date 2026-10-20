import { getActiveAgentOnlyHistory } from "../sessions/history-utils.js";
import { NativeHistorySummaryUtils } from "../sessions/input-processor-utils.js";
import { createResponseInputUtils } from "../sessions/response-input-utils.js";
import {
  createResponseErrorUtils,
  ServerErrorCode,
} from "../models/response-error-utils.js";
import {
  createHistoryTruncateUtils,
  PtlErrorUtils,
  PTL_RETRY_MARKER,
  MAX_PTL_RETRIES,
} from "../context/response-history-utils.js";
export const TEXTUAL_TOOL_CALL_RETRY_MARKER = "[TEXTUAL_TOOL_CALL_RECOVERY]";
export const MediaContentErrorType = {
  IMAGE_SIZE_TOO_LARGE: "image_size_too_large",
  REQUEST_BODY_TOO_LARGE: "request_body_too_large",
  TOO_MANY_IMAGES: "too_many_images",
  INVALID_IMAGE: "invalid_image",
  MULTIMODAL_CONTENT_SHAPE: "multimodal_content_shape",
  UNKNOWN: "unknown",
} as const;
export type ResponseInterceptorRuntime = {
  getAgentService(): { runDefault(input: any, options: any): Promise<any> };
  getAgentManager(): any;
  utilities: ReturnType<typeof createResponseInterceptorUtilities>;
  logger: {
    info(...args: any[]): void;
    debug(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  };
  stateMachine: any;
  contextCompactSummarizer: any;
  productManager: any;
  telemetryService: any;
};
/** Container lookups become explicit, lazy dependencies; no SDK classes are replaced. */
export class NativeResponseInterceptor {
  [key: string]: any;
  constructor(readonly runtime: ResponseInterceptorRuntime) {
    Object.assign(this, runtime);
  }
}
export function createResponseInterceptorUtilities(
  options: {
    generateUUUID?: () => string;
    getCurrentConfiguration?: () => any;
  } = {},
) {
  const InputItemUtils = createResponseInputUtils(options.generateUUUID);
  return {
    InputItemUtils,
    ErrorUtils: createResponseErrorUtils(options.getCurrentConfiguration),
    HistoryUtils: { getActiveAgentOnlyHistory },
    SummaryUtils: NativeHistorySummaryUtils,
    SessionUtils: {
      isSubAgent: (session: any) =>
        !!session.storeId && session.storeId !== session.id,
    },
    ServerErrorCode,
    HistoryTruncateUtils: createHistoryTruncateUtils(InputItemUtils),
    PtlErrorUtils,
    PTL_RETRY_MARKER,
    MAX_PTL_RETRIES,
  };
}

import { ContextTruncationInterceptor } from "./context-truncation-interceptor.js";
import { finishReasonErrorInterceptor } from "./finish-reason-error-interceptor.js";
import { TextualToolCallInterceptor } from "./textual-tool-call-interceptor.js";
import { TruncatedToolCallInterceptor } from "./truncated-tool-call-interceptor.js";
import { QueuedMessagesCleanupInterceptor } from "./queued-messages-cleanup-interceptor.js";
import { MediaContentErrorInterceptor } from "./media-content-error-interceptor.js";
import { FallbackModelErrorInterceptor } from "./fallback-model-error-interceptor.js";
import { ModelPermissionErrorInterceptor } from "./model-permission-error-interceptor.js";
import type { ResponseInterceptorRuntime } from "./response-interceptor-runtime.js";
// Component pushes metadata (37824), autoBind iterates it backwards (53076).
// All eight bindings occur in the same synchronous 71915 module.
export const NATIVE_RESPONSE_INTERCEPTOR_ORDER = [
  ModelPermissionErrorInterceptor,
  FallbackModelErrorInterceptor,
  MediaContentErrorInterceptor,
  QueuedMessagesCleanupInterceptor,
  TruncatedToolCallInterceptor,
  TextualToolCallInterceptor,
  finishReasonErrorInterceptor,
  ContextTruncationInterceptor,
] as const;
export function createNativeResponseInterceptors(
  runtime: ResponseInterceptorRuntime,
) {
  return NATIVE_RESPONSE_INTERCEPTOR_ORDER.map(
    (Factory) => new Factory(runtime),
  );
}

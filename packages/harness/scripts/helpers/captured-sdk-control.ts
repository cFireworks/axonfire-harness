import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { setMaxListeners } from "node:events";
import { PermissionMode } from "../../src/permissions/permission.js";
export const SDK_CONTROL_CLASSES = [
  ["StdoutWriter", 7794169, 7794674],
  ["SdkPermissionClientImpl", 7795251, 7796834],
  ["SdkHooksManagerImpl", 7797641, 7800832],
  ["SdkMcpMessageClientImpl", 7801845, 7803380],
  ["SdkElicitationClientImpl", 7804207, 7805343],
  ["ControlSignalHandlerImpl", 7806184, 7808272],
  ["SdkInitializeStateServiceImpl", 7810342, 7810807],
  ["InitializeHandler", 7811554, 7814144],
  ["SetPermissionModeHandler", 7820329, 7821587],
  ["GetAvailableModesHandler", 7822816, 7823318],
  ["GetAvailableModelsHandler", 7823983, 7824300],
  ["SetModelHandler", 7825195, 7826336],
] as const;
export function loadCapturedSdkControl(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const guards = source.slice(
      source.indexOf("function isControlRequest(", 7791300),
      source.indexOf('let eh=Symbol("SdkPermissionClient")', 7791300),
    ),
    abort = source.slice(
      12986712,
      source.indexOf("function unlimitAbortSignalListeners(", 12986712),
    );
  return (runtime: any) => {
    const context: any = {
      Error,
      AbortController,
      Map,
      Set,
      Object,
      Promise,
      JSON,
      RegExp,
      Date: { now: runtime.now },
      setTimeout: runtime.setTimeout,
      clearTimeout: runtime.clearTimeout,
      process: { stdout: runtime.stdout },
      eu: { setMaxListeners },
      tF: {
        PermissionMode,
        CONFIGURATION_ENTERPRISE_ENDPOINT: "enterpriseEndpoint",
      },
      tv: { McpScope: { SDK: "sdk" } },
      tP: {
        ProductEnviroment: {
          External: "external",
          Internal: "internal",
          IOA: "iOA",
          Selfhosted: "selfhosted",
          Cloudhosted: "cloudhosted",
        },
      },
    };
    context.tC = {
      Deferred:
        runtime.Deferred ??
        runInNewContext(`(${source.slice(117049, 117147)})`, context),
    };
    context.tE = runInNewContext(
      `${guards};({isControlRequest,isControlResponse,isControlCancelRequest,DEFAULT_CONTROL_SIGNAL_CONFIG:{requestTimeoutMs:60000}})`,
      context,
    );
    context.tD = {
      createAbortController: runInNewContext(
        `${abort};createAbortController`,
        context,
      ),
    };
    return runInNewContext(
      "({" +
        SDK_CONTROL_CLASSES.map(
          ([name, start, end]) => `${name}:(${source.slice(start, end)})`,
        ).join(",") +
        "})",
      context,
    );
  };
}

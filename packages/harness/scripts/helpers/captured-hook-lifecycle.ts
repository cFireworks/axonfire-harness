import { runInNewContext } from "node:vm";
import { loadCapturedAutoMemory } from "./captured-auto-memory.js";
import { HookEvent, HookBlockedError } from "../../src/hooks/hook-constants.js";
import { ToolResult } from "../../src/tools/tool-result.js";
import { PermissionDeniedError } from "../../src/tools/native-tool-errors.js";
export const hookLifecycleEvidence = [
  ["SessionHookManagerImpl", 11017694],
  ["ToolHookManagerImpl", 11942842],
] as const;
export const toolPipelineMethods = [
  "getPlainToolInput",
  "executeToolWithHooks",
  "extractRawResponse",
];
export function loadCapturedHookLifecycle(source: string) {
  const base = loadCapturedAutoMemory(source);
  return {
    ...base,
    construct(name: string, runtime: any) {
      const p = hookLifecycleEvidence.find((e) => e[0] === name)?.[1];
      const code = p
        ? base.text(base.cls(p + 1))
        : "class{" +
          toolPipelineMethods
            .map((k) =>
              base.text(
                base.cls(11660000).body.body.find((m: any) => m.key.name === k),
              ),
            )
            .join("\n") +
          "}";
      const globals = {
        Error,
        Date: { now: runtime.now },
        process: { env: runtime.env, cwd: runtime.getCwd },
        console: { error: runtime.consoleError },
        AB: runtime.utilities,
        nW: runtime.utilities,
        AZ: runtime.trigger,
        l0: runtime.trigger,
        Ah: { HookEvent, HookBlockedError },
        l1: { HookEvent },
        AV: { PRODUCT_CLI_NAME: runtime.productCliName },
        o3: runtime.toolErrors,
        nC: {
          isToolExecutionError: runtime.isToolExecutionError,
          PermissionDeniedError,
          ToolResult,
        },
        nk: { ContainerUtil: { get: runtime.getPaymentInterceptor } },
        oQ: { PaymentInterceptor: "payment" },
        ...runtime.helpers,
      };
      const Native = runInNewContext("(" + code + ")", globals);
      return Object.assign(new Native(), runtime.dependencies);
    },
    helpers(runtime: any) {
      const names = ["registerWatchPaths", "extractLastAssistantMessageText"];
      return runInNewContext(
        "(function(){" +
          names
            .map((n) => base.text(base.fn(n, 11015000, 11017694)))
            .join(";") +
          ";return{" +
          names.join(",") +
          "}})()",
        { AS: runtime.path, AX: runtime.fs, Error },
      );
    },
  };
}

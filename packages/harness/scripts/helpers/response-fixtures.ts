import { HarnessSession } from "../../src/sessions/session.js";
import {
  createResponseInterceptorUtilities,
  type ResponseInterceptorRuntime,
} from "../../src/responses/response-interceptor-runtime.js";
import { createSessionResultObservers } from "../../src/sessions/session-result-runtime.js";
export const ownedUser = (
  id: string,
  text = "owned question",
  data: any = {},
): any => ({
  id,
  type: "message",
  role: "user",
  content: [{ type: "input_text", text }],
  providerData: data,
});
export const ownedAnswer = (
  id: string,
  text = "owned answer",
  data: any = {},
): any => ({
  id,
  type: "message",
  role: "assistant",
  status: "completed",
  content: [{ type: "output_text", text }],
  providerData: data,
});
export function responseFixture(nativeUtilities?: any) {
  let id = 0;
  const next = () => `owned-id-${++id}`,
    calls: any[] = [],
    logs: any[] = [],
    session = new HarnessSession("owned");
  const snapshot = (v: any): any =>
    v instanceof Error ? { message: v.message } : structuredClone(v);
  const logger: any = Object.fromEntries(
    ["info", "warn", "debug", "error"].map((level) => [
      level,
      (...args: any[]) => logs.push([level, ...args.map(snapshot)]),
    ]),
  );
  const telemetryService: any = createSessionResultObservers().telemetryService;
  for (const key of Object.keys(telemetryService))
    telemetryService[key] = (...args: any[]) =>
      calls.push([key, ...args.slice(1).map(snapshot)]);
  const service = {
    async runDefault(input: any, options: any) {
      calls.push([
        "run",
        snapshot(input),
        {
          context: options.context.id,
          bypassMessageQueue: options.bypassMessageQueue,
        },
      ]);
    },
  };
  const runtime: ResponseInterceptorRuntime = {
    utilities: nativeUtilities
      ? nativeUtilities(next)
      : createResponseInterceptorUtilities({
          generateUUUID: next,
          getCurrentConfiguration: () => ({
            endpoint: "https://owned.invalid/v1",
          }),
        }),
    getAgentService: () => service,
    getAgentManager: () => ({
      async getDefault() {
        return { name: "cli" };
      },
      async getModels() {
        return [{ id: "owned-model" }];
      },
    }),
    logger,
    telemetryService,
    stateMachine: {
      getSnapshot: () => ({ status: "model_done" }),
      isBusy: () => true,
      forceIdle: (_s: any, reason: any) => calls.push(["idle", reason]),
    },
    contextCompactSummarizer: {
      async compactAndSummarize(_s: any, options: any) {
        calls.push(["compact", options]);
        return false;
      },
    },
    productManager: {
      async sync(force: any) {
        calls.push(["sync", force]);
      },
    },
  };
  session.history = [ownedUser("user")];
  const context: any = {
    session,
    result: { newItems: [] },
    modelResponseMetadata: {},
  };
  return { runtime, session, context, calls, logs };
}

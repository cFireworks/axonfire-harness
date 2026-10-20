// Explicit standalone ownership/DI adapter, not original product bootstrap.
import * as sdk from "@openai/agents-core";
import { randomUUID } from "node:crypto";
import { jsonrepair } from "jsonrepair";
import { createNativeRunner } from "./native-runner.js";
import { createNativeAgentRunUtilities } from "../agents/native-agent-run-utilities.js";
import { createCapturedAcpModules } from "../protocol/captured-acp-modules.js";
import { createNativeAcpServices } from "../protocol/native-acp-services.js";
import { SessionRunEventType } from "../sessions/run-state-types.js";
import { TokenUtils } from "../context/token-utils.js";

export interface NativeRunnerHostOptions {
  modelProvider: sdk.ModelProvider;
  sessionManager: any;
  stateMachine: any;
  agentManager: any;
  productManager: { waitConfiguration(): Promise<any> };
  compactor: any;
  loopDetector?: any;
  telemetryService?: any;
  logger?: any;
  env: Record<string, string | undefined>;
  tracingDisabled?: boolean;
}
export function createNativeRunnerHost(options: NativeRunnerHostOptions) {
  const logger = {
    debug: (...args: any[]) => options.logger?.debug?.(...args),
    info: (...args: any[]) => options.logger?.info?.(...args),
    warn: (...args: any[]) => options.logger?.warn?.(...args),
  };
  const utilities: any = {},
    modules: any = {
      25301: sdk,
      28894: { jsonrepair },
      71915: { SessionRunEventType },
      93039: utilities,
      80699: {
        generateUUUID: randomUUID,
        ContainerUtil: {
          get(token: any) {
            if (token === native.getModule(67330).ContextCompactSummarizer)
              return options.compactor;
            throw Error("Unsupported standalone Runner DI token");
          },
        },
      },
    };
  // Only the inert constants/XML factories are consumed here, not ACP file/OS services.
  const base = createCapturedAcpModules({
    modules,
    env: options.env,
    fs: {},
    os: {},
  });
  modules[69466] = base.getModule(69466);
  modules[66545] = modules[69466];
  const originalUtilities = createNativeAgentRunUtilities({
    modules,
    env: options.env,
    getModule: base.getModule,
  });
  const originalSdk = originalUtilities.getModule(18553);
  // Host privacy policy is applied at the borrowed SDK constructor boundary,
  // never by altering the original RunnerFactory.create body or node_modules.
  class OwnedRunner extends sdk.Runner {
    constructor(config: any) {
      super({ ...config, tracingDisabled: options.tracingDisabled });
    }
  }
  modules[18553] =
    options.tracingDisabled === undefined
      ? originalSdk
      : { ...originalSdk, Runner: OwnedRunner };
  const services = createNativeAcpServices({
    modules,
    env: options.env,
    getModule: originalUtilities.getModule,
  });
  Object.assign(utilities, {
    HistoryUtils: originalUtilities.getModule(21580).HistoryUtils,
    SessionUtils: services.getModule(7340).SessionUtils,
    UsageUtils: services.UsageUtils,
    TokenUtils,
  });
  const pending = new Set<Promise<void>>();
  let closing = false;
  const native = createNativeRunner({
    modules,
    env: options.env,
    getModule: originalUtilities.getModule,
    setImmediate(operation: () => Promise<void>) {
      if (closing) throw Error("Standalone Runner host is closed");
      let finish!: () => void;
      const done = new Promise<void>((resolve) => {
        finish = resolve;
      });
      pending.add(done);
      return setImmediate(() => {
        const complete = () => {
          pending.delete(done);
          finish();
        };
        const fail = (error: unknown) => {
          try {
            logger.warn("[RunnerHost] Deferred operation failed:", error);
          } catch {
            /* Host bookkeeping must settle even when an external logger throws. */
          } finally {
            complete();
          }
        };
        // Preserve the original async callback's synchronous prefix: no added microtask before operation().
        try {
          void Promise.resolve(operation()).then(complete, fail);
        } catch (error) {
          fail(error);
        }
      });
    },
  });
  const loopDetector =
    options.loopDetector ?? new native.ToolCallLoopDetectorImpl();
  if (!options.loopDetector) loopDetector.logger = logger;
  const factory = new native.RunnerFactoryImpl();
  Object.assign(factory, {
    modelProvider: options.modelProvider,
    sessionManager: options.sessionManager,
    stateMachine: options.stateMachine,
    agentManager: options.agentManager,
    productManager: options.productManager,
    toolCallLoopDetector: loopDetector,
    logger,
    telemetryService: options.telemetryService,
  });
  const provider = new native.RunnerProviderImpl();
  provider.runnerFactory = factory;
  return {
    native,
    factory,
    provider,
    loopDetector,
    utilities,
    async close() {
      closing = true;
      while (pending.size) await Promise.allSettled([...pending]);
    },
  };
}

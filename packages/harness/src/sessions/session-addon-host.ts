import { createNativeSessionModes } from "./native-session-modes.js";
import { createNativeSessionAddons } from "./native-session-addons.js";
export type SessionAddonHostOptions = {
  systemPromptService?: {
    initialize?(): Promise<any>;
    renderSystemPrompt(options: any): Promise<string | undefined>;
    collectSystemPromptVariables?(options: any): Promise<any>;
    cleanup?(): Promise<any>;
  };
  resolver?: { resolveConfig(request: any): Promise<any> };
  resolveClawCwd?: () => string;
  logger?: any;
  runtime?: any;
};
/** Desktop session composition, without its daemon, account discovery or process launcher. */
export function createSessionAddonHost(options: SessionAddonHostOptions = {}) {
  const modes = createNativeSessionModes();
  const native = createNativeSessionAddons({
    ...options.runtime,
    modes,
    ...(options.resolveClawCwd
      ? { resolveClawCwd: options.resolveClawCwd }
      : {}),
  });
  const logger = Object.fromEntries(
    ["info", "warn", "error"].map((k) => [
      k,
      (...args: any[]) => options.logger?.[k]?.(...args),
    ]),
  );
  const resolver = Object.assign(new native.NativeSessionAddonResolver(), {
    runtimeConfigResolver:
      options.resolver ??
      (options.systemPromptService
        ? native.createSessionRuntimeConfigResolver(
            Promise.resolve({
              logger,
              systemPromptService: options.systemPromptService,
            }),
          )
        : undefined),
  });
  let closed = false,
    closing: Promise<void> | undefined;
  const pending = new Set<Promise<any>>();
  return {
    native,
    modes,
    resolver,
    resolve(request: {
      sessionId: string;
      cwd: string;
      desiredConfig: any;
      currentRuntimeConfig?: any;
    }) {
      if (closed) return Promise.reject(Error("Session addon host is closed"));
      const desiredConfig = modes.normalizeDesiredConfig(request.desiredConfig);
      const job = resolver.resolveRuntimeConfig({ ...request, desiredConfig });
      pending.add(job);
      void job.then(
        () => pending.delete(job),
        () => pending.delete(job),
      );
      return job;
    },
    close() {
      return (closing ??= (async () => {
        closed = true;
        while (pending.size) await Promise.allSettled([...pending]);
      })());
    },
    get pendingCount() {
      return pending.size;
    },
  };
}

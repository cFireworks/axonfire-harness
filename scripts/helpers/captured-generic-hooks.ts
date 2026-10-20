import { runInNewContext } from "node:vm";
import * as SDK from "@openai/agents-core";
import { loadCapturedAutoMemory } from "./captured-auto-memory.js";
import { HookEvent, HookPriority } from "../../src/hooks/hook-constants.js";
export const genericHookEvidence = [
  ["HookExecutorImpl", 8446794],
  ["HookManagerImpl", 8454850],
  ["PromptHookServiceImpl", 8474519],
  ["ScopedHookRegistryImpl", 8477754],
] as const;
export const hookShellNames = [
  "getPowerShellHookShellConfig",
  "buildHookSpawnOptions",
  "isPowerShellExecutable",
  "expandBracedEnvReferences",
  "withHiddenPowerShellArgs",
  "tryBuildDirectPowerShellHookCommand",
];
export const promptProtocolNames = [
  "buildPromptHookArgumentsJson",
  "parsePromptHookResponse",
  "tryParse",
  "extractFromMarkdown",
  "extractFromText",
  "normalize",
];
export function loadCapturedGenericHooks(source: string) {
  const base = loadCapturedAutoMemory(source);
  const rule = base.nodes.find(
    (n) =>
      n.type === "VariableDeclarator" &&
      n.id.name === "oV" &&
      n.start > 8453000 &&
      n.end < 8454850,
  );
  const functions = (names: string[], min: number, max: number, globals: any) =>
    runInNewContext(
      "(function(){" +
        names.map((name) => base.text(base.fn(name, min, max))).join(";") +
        ";return{" +
        names.join(",") +
        "}})()",
      globals,
    );
  return {
    ...base,
    rules(PermissionUtils: any) {
      return runInNewContext(
        "(function(){const oW=/^([A-Za-z_][A-Za-z0-9_]*)(?:\\(([^)]*)\\))?$/;const oV=" +
          base.text(rule.init) +
          ";return oV})()",
        { oz: { PermissionUtils } },
      );
    },
    shell(runtime: any) {
      return functions(hookShellNames, 8444000, 8446794, {
        oK: runtime.shell,
        process: { env: runtime.env },
      });
    },
    protocol(cwd: () => string) {
      return functions(promptProtocolNames, 8470000, 8474520, {
        oH: { HookEvent },
        process: { cwd },
      });
    },
    construct(name: string, runtime: any) {
      const anchor = genericHookEvidence.find((e) => e[0] === name)?.[1];
      if (!anchor) throw Error(name);
      const globals = {
        Error,
        AbortController,
        Buffer,
        process: { env: runtime.env },
        Date: { now: runtime.now },
        setTimeout: runtime.setTimeout,
        clearTimeout: runtime.clearTimeout,
        fetch: runtime.fetch,
        oH: { HookEvent, HookPriority },
        oK: runtime.shell,
        iJ: { spawn: runtime.spawn },
        o$: 60000,
        nB: runtime.utilities,
        oJ: runtime.pluginUtilities,
        oV: runtime.ifRule,
        ...runtime.shellHelpers,
        ...runtime.promptProtocol,
        r4: {
          AgentNames: { PROMPT_HOOK_EVALUATOR: "promptHookEvaluator" },
          AgentService: "agent-service",
          RunnerProvider: "runner",
          AgentManager: "agent-manager",
        },
        r6: {
          ContainerUtil: {
            get: (name: string) =>
              name === "agent-service"
                ? runtime.getAgentService()
                : name === "runner"
                  ? runtime.dependencies.runnerProvider
                  : runtime.dependencies.agentManager,
          },
        },
        iN: SDK,
        oX: SDK,
        o0: { AgentPurpose: { PromptHook: "prompt_hook" } },
      };
      const Native = runInNewContext(
        "(" + base.text(base.cls(anchor + 1)) + ")",
        globals,
      );
      return Object.assign(new Native(), runtime.dependencies);
    },
  };
}

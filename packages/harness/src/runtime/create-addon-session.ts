import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm, realpath, lstat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHarness, type HarnessOptions } from "./create-harness.js";
import {
  createSessionAddonHost,
  type SessionAddonHostOptions,
} from "../sessions/session-addon-host.js";
import { PermissionMode } from "../permissions/permission.js";
import { createNativeSessionAddons } from "../sessions/native-session-addons.js";
const activeStates = new Set<string>();
/** One independently owned backend per Desktop-style session. Not a daemon replacement.
 * Trusted settings/plugins can execute Hooks. Native craft/expert default to
 * bypassPermissions; choose desiredConfig.permissionMode='default' for approval.
 */
export async function createAddonSession(options: {
  harness: Omit<HarnessOptions, "stateDir">;
  stateRoot: string;
  sessionId?: string;
  resume?: boolean;
  desiredConfig: any;
  addons?: SessionAddonHostOptions;
  language?: string;
  envRouteMode?: string;
}) {
  const sessionId = options.sessionId ?? randomUUID();
  if (!/^[a-zA-Z0-9_-]+$/.test(sessionId))
    throw Error("Invalid addon session identifier");
  const cwd = resolve(options.harness.workDir);
  await createNativeSessionAddons().assertSessionCwdUsable(cwd);
  await mkdir(resolve(options.stateRoot), { recursive: true });
  const canonicalRoot = await realpath(resolve(options.stateRoot));
  const stateDir = join(canonicalRoot, sessionId);
  if (
    await lstat(stateDir).then(
      (s) => s.isSymbolicLink(),
      (e) => {
        if (e.code === "ENOENT") return false;
        throw e;
      },
    )
  )
    throw Error("Addon backend state cannot be a symlink");
  if (activeStates.has(stateDir))
    throw Error("Addon session backend is already open: " + sessionId);
  let harness: Awaited<ReturnType<typeof createHarness>> | undefined,
    tempDir: string | undefined,
    closing: Promise<void> | undefined,
    closed = false;
  const owner = createSessionAddonHost(options.addons);
  activeStates.add(stateDir);
  let native = owner.native,
    systemPromptFile: string | null = null,
    promptVarsFile: string | null = null;
  async function close() {
    return (closing ??= (async () => {
      closed = true;
      try {
        await harness?.close();
      } finally {
        try {
          await owner.close();
          native.cleanupAgentCliSystemPromptFile(systemPromptFile);
          native.cleanupAgentCliPromptVarsFile(promptVarsFile);
          if (tempDir) await rm(tempDir, { recursive: true, force: true });
        } finally {
          activeStates.delete(stateDir);
        }
      }
    })());
  }
  try {
    const runtimeConfig = await owner.resolve({
      sessionId,
      cwd,
      desiredConfig: options.desiredConfig,
    });
    await mkdir(stateDir, { recursive: true });
    tempDir = await mkdtemp(join(stateDir, "addon-runtime-"));
    // Exact native file/repair decisions; OS temp root is redirected to this owned directory.
    native = createNativeSessionAddons({ os: { tmpdir: () => tempDir! } });
    systemPromptFile = native.writeAgentCliSystemPromptFile(
      sessionId,
      runtimeConfig.systemPrompt,
    );
    promptVarsFile = native.writeAgentCliPromptVarsFile(
      sessionId,
      runtimeConfig.promptVariables,
    );
    const cliArgs = native.buildAgentCliRuntimeArgs({
      runtimeConfig,
      cwd,
      systemPromptFile,
      promptVarsFile,
      language: options.language,
      envRouteMode: options.envRouteMode,
    });
    const cliOptions: any = {
      ...options.harness.agentManager?.getCliOptions?.(),
    };
    for (const key of ["systemPrompt", "systemPromptFile", "tools"])
      delete cliOptions[key];
    const fields: Record<string, string> = {
      "--model": "model",
      "--tools": "tools",
      "--system-prompt": "systemPrompt",
      "--system-prompt-file": "systemPromptFile",
      "--settings": "settings",
      "--prompt-vars-file": "promptVarsFile",
      "--permission-mode": "permissionMode",
      "--permission-mode-before-plan": "permissionModeBeforePlan",
    };
    for (let i = 0; i < cliArgs.length; i++) {
      const key = fields[cliArgs[i]!];
      if (key) cliOptions[key] = cliArgs[++i];
    }
    const allowedAt = cliArgs.indexOf("--allowedTools");
    const allowedTools: string[] = [];
    if (allowedAt >= 0)
      for (
        let i = allowedAt + 1;
        i < cliArgs.length && !cliArgs[i]!.startsWith("--");
        i++
      )
        allowedTools.push(cliArgs[i]!);
    harness = await createHarness({
      ...options.harness,
      stateDir,
      ...(runtimeConfig.model ? { model: runtimeConfig.model } : {}),
      ...(promptVarsFile ? { promptVarsFile } : {}),
      nativeSettings: {
        ...options.harness.nativeSettings,
        cliOptions: {
          ...options.harness.nativeSettings?.cliOptions,
          ...(cliOptions.settings ? { settings: cliOptions.settings } : {}),
        },
      },
      agentManager: {
        ...options.harness.agentManager,
        getCliOptions: () => cliOptions,
      },
    });
    const session = await harness.openSession(
      options.resume ? sessionId : undefined,
      {
        ...(options.resume ? {} : { sessionId }),
        permissionMode: cliOptions.permissionMode as PermissionMode,
      },
    );
    if (cliOptions.tools !== undefined)
      session.options.tools = cliOptions.tools;
    if (cliOptions.permissionModeBeforePlan !== undefined)
      session.options.permissionModeBeforePlan =
        cliOptions.permissionModeBeforePlan;
    session.requestOptions.allowedTools = allowedTools;
    const backend = harness;
    return {
      harness,
      session,
      runtimeConfig,
      manifest: runtimeConfig.addonManifest,
      cliArgs,
      owner,
      tempDir,
      async prompt(
        input: Parameters<typeof backend.prompt>[1],
        promptOptions?: Parameters<typeof backend.prompt>[2],
      ) {
        if (closed) throw Error("Addon session backend is closed");
        native.ensureAgentCliPromptVarsFile(
          sessionId,
          promptVarsFile,
          runtimeConfig.promptVariables,
        );
        return backend.prompt(session, input, promptOptions);
      },
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}

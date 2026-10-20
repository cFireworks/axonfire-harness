import { NoopTrace, withTrace } from "@openai/agents-core";
import { createHarness, type HarnessOptions } from "./create-harness.js";
import { StandaloneTeamGateway } from "./standalone-team-gateway.js";
import { TeammateRunner, getArgValue, hasArg } from "../teams/teammate-runner.js";
import { PermissionBridgeClient } from "../teams/permission-bridge.js";
import { PermissionMode } from "../permissions/permission.js";
class LocalNoopTrace extends NoopTrace { override clone(): LocalNoopTrace { return new LocalNoopTrace(); } }

/** Standalone startup adapter for recovered TeammateRunner. Native startup,
 * Gateway, approval UI and signal teardown are NOT claimed recovered here. */
export async function runStandaloneTeammate(args: string[], options: Pick<HarnessOptions, "workDir" | "stateDir" | "apiKey" | "baseURL" | "model" | "logger" | "webTools" | "mediaTools">): Promise<void> {
  const team = getArgValue("--team-name", args), member = getArgValue("--agent-name", args);
  if (!team || !member) throw new Error("Teammate mode requires --team-name and --agent-name");
  // Host validates path components before passing native filename composition.
  for (const value of [team, member]) if (!/^[\p{L}\p{N}_@ .-]+$/u.test(value) || value === "." || value === "..") throw new Error("Unsafe Team/member path component");
  const leader = getArgValue("--leader-endpoint", args), maxTurnsText = getArgValue("--max-turns", args), maxTurns = maxTurnsText === undefined ? undefined : Number(maxTurnsText);
  if (maxTurns !== undefined && (!Number.isInteger(maxTurns) || maxTurns <= 0)) throw new Error("--max-turns must be a positive integer");
  const client = leader ? new PermissionBridgeClient(leader, member, team) : undefined;
  const bypass = hasArg("-y", args) || hasArg("--dangerously-skip-permissions", args) || getArgValue("--permission-mode", args) === PermissionMode.BypassPermissions;
  const runtime = await createHarness({ ...options, memoryExtraction: false,
    // Explicit host relay: native Runner only probes isAvailable().
    approveTool: async (name, input) => { const decision = await client?.requestPermission(name, input, ""); return decision?.decision === "allow" || decision?.decision === "allowAll"; },
  });
  const gateway = new StandaloneTeamGateway({ mailbox: runtime.teamMailbox });
  const listeners: Array<["SIGTERM" | "SIGINT", () => void]> = [];
  const resultSubscriptions: Array<{ unsubscribe(): void }> = [];
  let requestedExit: number | undefined;
  const runner = new TeammateRunner(runtime.teamMailbox, {
    create: async () => {
      const session = await runtime.openSession(undefined, { permissionMode: bypass ? PermissionMode.BypassPermissions : PermissionMode.Default });
      session.agentName = getArgValue("--agent-type", args) || "general-purpose";
      resultSubscriptions.push(session.resultSubject.subscribe((result: any) => {
        if (result?.completed) void Promise.resolve(result.completed).catch((error) => options.logger?.warn(`Teammate stream failed: ${String(error)}`));
      }));
      gateway.observeSession(session); return session;
    },
    initRunResultHandler: (session) => runtime.sessions.initRunResultHandler(session),
  }, { runDefault: async (input, config) => { await runtime.service.runDefault(input, { ...config, ...(maxTurns ? { maxTurns } : {}) }); } },
  (name, agent) => runtime.teamMailbox.getTeamMemberEndpointPath(name, agent), { ...options.logger, error: (text, error) => options.logger?.warn(`${text}${error ? ` ${String(error)}` : ""}`) }, {
    args, exit: (code) => { requestedExit = code; }, endpointProvider: { get: async () => gateway.getEndpoint() },
    onSignal: (signal, listener) => { listeners.push([signal, listener]); process.on(signal, listener); },
  });
  try {
    // Product Startup warms the default agent before selecting a subagent.
    // Prompt-context model initialization itself asks for that default agent.
    await runtime.agents.getDefault();
    await runtime.teamManager.loadTeam(team);
    await gateway.start();
    await withTrace(new LocalNoopTrace(), () => runner.runService(team, member));
  } finally {
    runner.shuttingDown = true;
    for (const [signal, listener] of listeners) process.removeListener(signal, listener);
    // Native runService exits immediately after mailboxLoop. This independent
    // host first aborts/settles the sole SDK consumer before flushing history.
    try {
      const session = runner.session;
      if (session) {
        session.abortController.abort();
        for (;;) {
          const result = session.resultSubject.value;
          if (!result) break;
          await Promise.resolve((result as any).completed).catch(() => undefined);
          await runtime.sessions.waitForResultHandled(result);
          await runtime.interruptions.waitForResultHandled(result);
          if (session.resultSubject.value === result) break;
        }
        await runner.writeEndpointFile(team, member);
      }
    } finally {
      try { await gateway.close(); } finally {
        try { await runtime.close(); } finally { for (const subscription of resultSubscriptions) subscription.unsubscribe(); }
      }
    }
  }
  if (requestedExit && requestedExit !== 0) throw new Error(`Teammate exited with code ${requestedExit}`);
}

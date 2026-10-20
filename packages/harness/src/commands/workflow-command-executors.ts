import { CommandMessageUtils } from "./command-message-utils.js";
import type { CommandExecution, CommandExecutor } from "./command-manager.js";
import type { SessionManager } from "../sessions/session-manager.js";
import type {
  WorkflowManager,
  WorkflowManagedRecord,
} from "../workflow/workflow-manager.js";
import type { WorkflowRegistryEntry } from "../workflow/workflow-types.js";
type CommandLogger = { warn?(message: string): void };
export class WorkflowsCommandExecutor implements CommandExecutor {
  readonly name = "/workflows";
  readonly autoGenerateHistory = false;
  constructor(
    readonly manager: Pick<WorkflowManager, "listActive">,
    readonly registry: { list(): Promise<WorkflowRegistryEntry[]> },
    readonly sessionManager: Pick<SessionManager, "addHistory">,
    readonly logger: CommandLogger = {},
  ) {}
  async execute(input: CommandExecution): Promise<void> {
    const output = await this.buildOutput();
    await this.appendHistory(input.session, input, output);
  }
  async buildOutput(): Promise<string> {
    const active = this.manager.listActive(),
      saved = await this.registry.list().catch(() => []);
    return [
      "# Workflows\n",
      this.renderRunningSection(active),
      "",
      this.renderSavedSection(saved),
    ].join("\n");
  }
  renderRunningSection(records: WorkflowManagedRecord[]): string {
    const lines = ["## Running"];
    if (!records.length) {
      lines.push("_(none)_");
      return lines.join("\n");
    }
    for (const record of records) {
      const duration = record.endedAt
          ? record.endedAt - record.startedAt
          : Date.now() - record.startedAt,
        cached =
          record.cachedAgentCount > 0
            ? ` cached:${record.cachedAgentCount}`
            : "";
      lines.push(
        `- **${record.name}** \`${record.runId.slice(0, 8)}\` · ${record.status} · ${formatElapsed(duration)} · phases:${record.phaseCount} agents:${record.agentCount}${cached}`,
      );
    }
    return lines.join("\n");
  }
  renderSavedSection(entries: WorkflowRegistryEntry[]): string {
    const lines = ["## Saved"];
    if (!entries.length) {
      lines.push("_(none)_");
      return lines.join("\n");
    }
    for (const entry of entries)
      lines.push(
        `- **/${entry.name}** _(${entry.scope})_${entry.description ? ` — ${entry.description}` : ""}`,
      );
    return lines.join("\n");
  }
  async appendHistory(
    session: CommandExecution["session"],
    input: CommandExecution,
    output: string,
  ): Promise<void> {
    try {
      await this.sessionManager.addHistory(session, [
        CommandMessageUtils.buildCaveat(),
        CommandMessageUtils.buildInput(input, this),
        CommandMessageUtils.buildOutput(output),
      ]);
    } catch (error) {
      this.logger.warn?.(
        `[/workflows] failed to append history: ${(error as Error).message}`,
      );
    }
  }
}
export function formatElapsed(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m${seconds % 60}s`;
}
export type SaveWorkflowArgs = {
  scope: string;
  runId?: string;
  name?: string;
  error?: string;
};
export class SaveWorkflowCommandExecutor implements CommandExecutor {
  readonly name = "/save-workflow";
  readonly autoGenerateHistory = false;
  constructor(
    readonly manager: Pick<WorkflowManager, "saveAs">,
    readonly sessionManager: Pick<SessionManager, "addHistory">,
    readonly logger: CommandLogger = {},
  ) {}
  async execute(input: CommandExecution): Promise<void> {
    const output = await this.run(input);
    await this.appendHistory(input.session, input, output);
  }
  async run(input: CommandExecution): Promise<string> {
    const args = this.parseArgs(input.args);
    if (args.error) return SaveWorkflowCommandExecutor.usage(args.error);
    if (!args.runId || !args.name) return SaveWorkflowCommandExecutor.usage();
    try {
      const saved = await this.manager.saveAs(
        input.session.id,
        args.runId,
        args.name,
        args.scope,
      );
      return `Dynamic workflow saved to ${saved.targetPath}. Invoke as /${args.name} or Workflow({name: "${args.name}"}) in future sessions.`;
    } catch (error) {
      return `Failed to save workflow: ${(error as Error).message}`;
    }
  }
  parseArgs(input: unknown[] | undefined): SaveWorkflowArgs {
    let runId: string | undefined,
      name: string | undefined,
      scope = "project";
    for (const raw of input ?? []) {
      const value = String(raw ?? "").trim();
      if (!value) continue;
      if (value === "--user") {
        scope = "user";
        continue;
      }
      if (value === "--project") {
        scope = "project";
        continue;
      }
      if (value.startsWith("--scope=")) {
        const next = value.slice(8);
        if (next === "project" || next === "user") {
          scope = next;
          continue;
        }
        return {
          scope,
          error: `Invalid scope "${next}"; use "project" or "user".`,
        };
      }
      if (value.startsWith("--"))
        return { scope, error: `Unknown flag "${value}".` };
      if (!runId) {
        runId = value;
        continue;
      }
      if (!name) {
        name = value;
        continue;
      }
      return { scope, error: `Unexpected extra argument "${value}".` };
    }
    return {
      scope,
      ...(runId !== undefined ? { runId } : {}),
      ...(name !== undefined ? { name } : {}),
    };
  }
  static usage(error?: string): string {
    return (
      (error ? `❌ ${error}\n\n` : "") +
      "**Usage:** `/save-workflow <runId> <name> [--scope=project|user]`\n\nSave a previous workflow run as a reusable command.\n- `<runId>`: full or 8-char prefix of a recent run id (see `/workflows`)\n- `<name>`: registry name; will be invokable via `/<name>` in future sessions\n- `--scope=project` (default): saves to `<cwd>/.codebuddy/workflows/`\n- `--scope=user`              : saves to `~/.codebuddy/workflows/` (visible across projects)"
    );
  }
  async appendHistory(
    session: CommandExecution["session"],
    input: CommandExecution,
    output: string,
  ): Promise<void> {
    try {
      await this.sessionManager.addHistory(session, [
        CommandMessageUtils.buildCaveat(),
        CommandMessageUtils.buildInput(input, this),
        CommandMessageUtils.buildOutput(output),
      ]);
    } catch (error) {
      this.logger.warn?.(
        `[/save-workflow] failed to append history: ${(error as Error).message}`,
      );
    }
  }
}

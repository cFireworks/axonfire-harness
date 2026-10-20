import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type TeamMessage = {
  from: string;
  text: string;
  summary?: string | undefined;
  timestamp: string;
  color?: string | undefined;
  read?: boolean;
  [key: string]: unknown;
};

export type TeamMailboxLogger = {
  debug?(message: string): void;
  info?(message: string): void;
};

/**
 * File-backed team mailbox used by in-process and detached teammates.
 *
 * WorkBuddy stores each inbox at `<home>/teams/<team>/inboxes/<member>.json`.
 * The caller supplies that product home so this reconstruction does not make
 * assumptions about the host application's config-directory policy.
 */
export class TeamMailbox {
  private readonly pollers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly homeDir: string,
    private readonly logger: TeamMailboxLogger = {},
  ) {}

  getTeamDir(teamName: string): string {
    return join(this.homeDir, "teams", teamName);
  }

  getTeamInboxesDir(teamName: string): string {
    return join(this.getTeamDir(teamName), "inboxes");
  }

  getTeamInboxPath(teamName: string, memberName: string): string {
    return join(this.getTeamInboxesDir(teamName), `${memberName}.json`);
  }

  getTeamConfigPath(teamName: string): string {
    return join(this.getTeamDir(teamName), "config.json");
  }

  getTeamMemberEndpointPath(teamName: string, memberName: string): string {
    return join(this.getTeamDir(teamName), "endpoints", `${memberName}.json`);
  }

  async send(
    teamName: string,
    recipient: string,
    message: TeamMessage,
  ): Promise<void> {
    const path = this.getTeamInboxPath(teamName, recipient);
    const inbox = await this.readInbox(path);
    inbox.push({ ...message, read: false });
    await this.writeInbox(path, inbox);
    this.logger.info?.(
      `Message sent from "${message.from}" to "${recipient}" in team "${teamName}"`,
    );
  }

  async broadcast(
    teamName: string,
    sender: string,
    message: TeamMessage,
  ): Promise<string[]> {
    const config = JSON.parse(
      await readFile(this.getTeamConfigPath(teamName), "utf8"),
    ) as { members?: Array<{ name?: string }> };
    const members = (config.members ?? [])
      .map((member) => member.name)
      .filter(
        (name): name is string => typeof name === "string" && name !== sender,
      );
    await Promise.all(
      members.map((member) => this.send(teamName, member, message)),
    );
    this.logger.info?.(
      `Broadcast from "${sender}" to ${members.length} members in team "${teamName}"`,
    );
    return members;
  }

  async getUnread(
    teamName: string,
    memberName: string,
  ): Promise<TeamMessage[]> {
    return (await this.getAll(teamName, memberName)).filter(
      (message) => !message.read,
    );
  }

  async getAll(teamName: string, memberName: string): Promise<TeamMessage[]> {
    return this.readInbox(this.getTeamInboxPath(teamName, memberName));
  }

  async markAllAsRead(
    teamName: string,
    memberName: string,
  ): Promise<void> {
    const path = this.getTeamInboxPath(teamName, memberName);
    const inbox = await this.readInbox(path);
    let changed = false;
    for (const message of inbox) {
      if (!message.read) {
        message.read = true;
        changed = true;
      }
    }
    if (changed) await this.writeInbox(path, inbox);
  }

  async createInbox(teamName: string, memberName: string): Promise<void> {
    const path = this.getTeamInboxPath(teamName, memberName);
    if (await this.pathExists(path)) return;
    const directory = this.getTeamInboxesDir(teamName);
    if (!(await this.pathExists(directory))) {
      await mkdir(directory, { recursive: true });
    }
    await this.writeInbox(path, []);
  }

  startPolling(
    teamName: string,
    memberName: string,
    handler: (messages: TeamMessage[]) => void | Promise<void>,
    intervalMs = 2_000,
  ): () => void {
    const key = `${teamName}/${memberName}`;
    this.stopPolling(key);
    const timer = setInterval(() => {
      void (async () => {
        try {
          const unread = await this.getUnread(teamName, memberName);
          if (unread.length > 0) {
            await handler(unread);
            await this.markAllAsRead(teamName, memberName);
          }
        } catch (error) {
          this.logger.debug?.(`Poll error for ${key}: ${String(error)}`);
        }
      })();
    }, intervalMs);
    timer.unref?.();
    this.pollers.set(key, timer);
    this.logger.info?.(
      `Started polling for "${memberName}" in team "${teamName}" every ${intervalMs}ms`,
    );
    return () => this.stopPolling(key);
  }

  stopPolling(key: string): void {
    const timer = this.pollers.get(key);
    if (!timer) return;
    clearInterval(timer);
    this.pollers.delete(key);
    this.logger.info?.(`Stopped polling for ${key}`);
  }

  stopAll(): void {
    for (const key of [...this.pollers.keys()]) this.stopPolling(key);
  }

  private async readInbox(path: string): Promise<TeamMessage[]> {
    try {
      if (!(await this.pathExists(path))) return [];
      const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
      return Array.isArray(parsed) ? (parsed as TeamMessage[]) : [];
    } catch {
      return [];
    }
  }

  private async writeInbox(
    path: string,
    messages: TeamMessage[],
  ): Promise<void> {
    const directory = dirname(path);
    if (!(await this.pathExists(directory))) {
      await mkdir(directory, { recursive: true });
    }
    await writeFile(path, JSON.stringify(messages, null, 2), "utf8");
  }

  private async pathExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }
}

export const INITIAL_ASSIGNMENT_SUMMARY_PREFIX = "Initial task assignment for ";
export const TEAM_MEMBER_COLORS = [
  "blue",
  "green",
  "yellow",
  "magenta",
  "cyan",
  "red",
] as const;

export function formatInitialAssignmentSummary(memberName: string): string {
  return `${INITIAL_ASSIGNMENT_SUMMARY_PREFIX}${memberName}`;
}

export function formatTeammateMessage(
  teammateId: string,
  summary: string,
  content: string,
): string {
  return `<teammate-message teammate_id="${teammateId}" summary="${summary}">\n${content}\n</teammate-message>`;
}

export function parseInitialAssignmentOwner(
  content: string,
): string | undefined {
  const escaped = INITIAL_ASSIGNMENT_SUMMARY_PREFIX.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  return content
    .match(
      new RegExp(
        `<teammate-message\\s+teammate_id="team-lead"\\s+summary="${escaped}([^"]+)"[^>]*>`,
        "i",
      ),
    )?.[1]
    ?.trim();
}

export function getTeamMemberColor(index: number): string {
  return TEAM_MEMBER_COLORS[index % TEAM_MEMBER_COLORS.length]!;
}

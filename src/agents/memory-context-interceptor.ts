import * as Aq from "node:path";
import type { AutoMemoryRuntime } from "../memory/auto-memory-runtime.js";
const A_ = {
    AgentRunInterceptorPriority: { MemoryContext: 1150 },
    AgentNames: { COMPACT: "compact" },
  },
  rf = {
    ENV_KEY_CODEBUDDY_DISABLE_AUTO_MEMORY: "CODEBUDDY_DISABLE_AUTO_MEMORY",
    ENV_KEY_CODEBUDDY_MEMORY_ENABLED: "CODEBUDDY_MEMORY_ENABLED",
    ENV_KEY_CODEBUDDY_TEAM_MEMORY_ENABLED: "CODEBUDDY_TEAM_MEMORY_ENABLED",
    ENV_KEY_CODEBUDDY_USER_ID: "CODEBUDDY_USER_ID",
    ENV_KEY_CODEBUDDY_TYPED_MEMORY_ENABLED: "CODEBUDDY_TYPED_MEMORY_ENABLED",
  },
  ry = { SessionRunEventType: { AGENT_STARTED: "AGENT_STARTED" } };
// Native UTF-16 7167120..7175582.
export class MemoryContextInterceptor {
  [key: string]: any;
  declare readonly priority: number;
  constructor(readonly runtime: AutoMemoryRuntime) {
    Object.assign(this, runtime.dependencies);
    this.priority = A_.AgentRunInterceptorPriority.MemoryContext;
  }
  async intercept(eA: any): Promise<any> {
    if (
      !Array.isArray(eA.input) ||
      eA.skipRun ||
      eA.agent.name === A_.AgentNames.COMPACT ||
      !(await this.isAutoMemoryEnabled())
    )
      return;
    let el: any = this.extractLastUserQuery(eA.input);
    if (this.shouldInjectMemoryContext(eA)) {
      let el: any = await this.generateMemoryPrompt();
      if (el) {
        let ec: any = `<system-reminder data-role="memory">${el}</system-reminder>`;
        (this.runtime.utilities.MessageUtils.addSystemReminder(
          eA.input,
          ec,
          "first",
        ),
          this.logger.setContext("MemoryContextInterceptor"),
          this.logger.debug("Injected auto memory context prompt"));
      }
    }
    await this.injectRelevantMemories(eA, el);
  }
  async isAutoMemoryEnabled(): Promise<any> {
    let eA: any = this.runtime.env[rf.ENV_KEY_CODEBUDDY_DISABLE_AUTO_MEMORY];
    if (void 0 !== eA) {
      if ("1" === eA) return !1;
      if ("0" === eA) return !0;
    }
    let el: any = this.runtime.env[rf.ENV_KEY_CODEBUDDY_MEMORY_ENABLED];
    if (void 0 !== el) return "true" === el.toLowerCase() || "1" === el;
    let ec: any = await this.settingsManager.get("memory");
    return ec?.autoMemoryEnabled === void 0 || ec.autoMemoryEnabled;
  }
  async isTeamMemoryEnabled(): Promise<any> {
    let eA: any = this.runtime.env[rf.ENV_KEY_CODEBUDDY_TEAM_MEMORY_ENABLED];
    if (void 0 !== eA) return "true" === eA.toLowerCase() || "1" === eA;
    let el: any = await this.settingsManager.get("memory");
    return el?.teamMemory?.enabled !== void 0 && el.teamMemory.enabled;
  }
  async getTeamUserId(): Promise<any> {
    let eA: any = this.runtime.env[rf.ENV_KEY_CODEBUDDY_USER_ID];
    if (eA) return eA;
    let el: any = await this.settingsManager.get("memory");
    if (el?.teamMemory?.userId) return el.teamMemory.userId;
    let eu: any = this.runtime.utilities.GitUtils.getGitUserName();
    return (
      eu ||
      (await Promise.resolve().then(() => this.runtime.os)).userInfo()
        .username ||
      void 0
    );
  }
  async isTypedMemoryEnabled(): Promise<any> {
    let eA: any = this.runtime.env[rf.ENV_KEY_CODEBUDDY_TYPED_MEMORY_ENABLED];
    if (void 0 !== eA) return "false" !== eA.toLowerCase() && "0" !== eA;
    let el: any = await this.settingsManager.get("memory");
    return el?.typedMemory === void 0 || el.typedMemory;
  }
  shouldInjectMemoryContext(eA: any): any {
    let el: any = 1 === eA.input.filter((eA: any) => "user" === eA.role).length,
      ec: any = !!(
        eA.session.options?.continue && !eA.session.options?.continued
      );
    return (
      !!el ||
      !!ec ||
      !this.runtime.utilities.MessageUtils.firstUserMessageContainsRole(
        eA.input,
        "memory",
      )
    );
  }
  async getMemoryDir(): Promise<any> {
    let eA: any,
      el: any = this.runtime.utilities.PathUtils.getCompressedWorkDir(),
      ec: any = await this.isTeamMemoryEnabled(),
      eu: any = await this.getTeamUserId();
    return (
      (eA =
        ec && eu
          ? this.runtime.utilities.PathUtils.getTeamMemoryDir(eu)
          : this.runtime.utilities.PathUtils.getProjectMemoryDir(el)),
      { projectId: el, memoryDir: eA }
    );
  }
  async generateMemoryPrompt(): Promise<any> {
    return (await this.isTypedMemoryEnabled())
      ? this.generateTypedMemoryPrompt()
      : this.generateLegacyMemoryPrompt();
  }
  async generateTypedMemoryPrompt(): Promise<any> {
    let { projectId: eA, memoryDir: el } = await this.getMemoryDir(),
      ec: any = (0, this.runtime.prompts.buildMemoryPrompt)({
        displayName: "auto memory",
        memoryDir: el,
        projectId: eA,
      });
    return `<memory>
${ec}
</memory>`;
  }
  async generateLegacyMemoryPrompt(): Promise<any> {
    let { projectId: eA, memoryDir: el } = await this.getMemoryDir(),
      ec: any = (0, Aq.join)(el, "MEMORY.md"),
      eu: any = "";
    try {
      if ((0, this.runtime.fs.existsSync)(ec)) {
        let eA: any = (eu = (0, this.runtime.fs.readFileSync)(
          ec,
          "utf-8",
        )).split("\n");
        if (
          (eA.length > 200 && (eu = eA.slice(0, 200).join("\n")),
          eu.length > 4e4)
        ) {
          let eA: any = eu.slice(0, 4e4),
            el: any = eA.lastIndexOf("\n");
          eu =
            el > 0
              ? eA.slice(0, el + 1) + "\n... (truncated)"
              : eA + "\n... (truncated)";
        }
      }
    } catch (eA: any) {
      this.logger.warn(
        `[MemoryContextInterceptor] Failed to read ${ec}: ${eA instanceof Error ? eA.message : String(eA)}`,
      );
    }
    let ed: any = eu.length > 0,
      ep: any = this.runtime.utilities.PathUtils.getSessionHistoryDir(eA);
    return `<memory>
# auto memory

You have a persistent auto memory directory at \`${el}/\`. This directory already exists — write to it directly with the Write tool (do not run mkdir or check for its existence). Its contents persist across conversations.

As you work, consult your memory files to build on previous experience.

## How to save memories:
- Organize memory semantically by topic, not chronologically
- Use the Write and Edit tools to update your memory files
- \`MEMORY.md\` is always loaded into your conversation context — lines after 200 will be truncated, so keep it concise
- Create separate topic files (e.g., \`debugging.md\`, \`patterns.md\`) for detailed notes and link to them from MEMORY.md
- Update or remove memories that turn out to be wrong or outdated
- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.

## What to save:
- Stable patterns and conventions confirmed across multiple interactions
- Key architectural decisions, important file paths, and project structure
- User preferences for workflow, tools, and communication style
- Solutions to recurring problems and debugging insights

## What NOT to save:
- Session-specific context (current task details, in-progress work, temporary state)
- Information that might be incomplete — verify against project docs before writing
- Anything that duplicates or contradicts existing CODEBUDDY.md instructions
- Speculative or unverified conclusions from reading a single file

## Explicit user requests:
- When the user asks you to remember something across sessions (e.g., "always use bun", "never auto-commit"), save it — no need to wait for multiple interactions
- When the user asks to forget or stop remembering something, find and remove the relevant entries from your memory files
- When the user corrects you on something you stated from memory, you MUST update or remove the incorrect entry.

## Searching past context

When looking for past context:
1. Search topic files in your memory directory:
\`\`\`
Grep with pattern="<search term>" path="${el}/" glob="*.md"
\`\`\`
2. Session transcript logs (last resort — large files, slow):
\`\`\`
Grep with pattern="<search term>" path="${ep}/" glob="*.jsonl"
\`\`\`
Use narrow search terms (error messages, file paths, function names) rather than broad keywords.
${
  ed
    ? `
## Current MEMORY.md contents

${eu}`
    : ""
}
</memory>`;
  }
  async injectRelevantMemories(eA: any, el: any): Promise<any> {
    let ec: any;
    if (!this.memoryRelevanceService) return;
    let eu: any = el || this.extractLastUserQuery(eA.input);
    if (!eu) return;
    let { memoryDir: ed } = await this.getMemoryDir();
    if (
      !(0, this.runtime.fs.existsSync)(ed) ||
      !(await this.memoryRelevanceService.isEnabled())
    )
      return;
    let ep: any = eA.session.abortSignal;
    if (ep?.aborted) return;
    (this.stateMachine.transition(eA.session, {
      type: ry.SessionRunEventType.AGENT_STARTED,
    }),
      await new Promise((eA: any) => this.runtime.setTimeout(eA, 50)));
    let eg: any = !1;
    try {
      let el: any = await this.getRelevantMemoriesContent(
        eu,
        ed,
        eA.session,
        ep,
      );
      if (el) {
        let ec: any = `<system-reminder data-role="memory">${el}</system-reminder>`;
        (this.runtime.utilities.MessageUtils.addSystemReminder(
          eA.input,
          ec,
          "last",
        ),
          this.logger.debug("Injected relevant memories"));
      }
    } catch (eA: any) {
      ec = eA;
    } finally {
      eg = !!ep?.aborted;
    }
    if (eg) {
      (this.logger.debug(
        "[MemoryContextInterceptor] Aborted by user, setting skipRun",
      ),
        (eA.skipRun = !0));
      try {
        let el: any =
            this.runtime.utilities.InputItemUtils.createAssistantMessage(
              this.runtime.utilities.INTERRUPTED_BY_USER_MESSAGE,
              {
                status: "incomplete",
                skipRun: !0,
                error: { message: "Request was aborted." },
              },
            ),
          ec: any = this.sessionManager;
        await ec.addHistory(eA.session, [el]);
      } catch (eA: any) {
        this.logger.warn(
          `[MemoryContextInterceptor] Failed to add interruption message: ${eA.message}`,
        );
      }
      this.stateMachine.forceIdle(eA.session, "memory-aborted-by-user");
      return;
    }
    if (ec) throw ec;
  }
  async getRelevantMemoriesContent(
    eA: any,
    el: any,
    ec: any,
    eu: any,
  ): Promise<any> {
    if (!this.memoryRelevanceService) return "";
    try {
      ec.memoriesSurfacedInSession ||
        (ec.memoriesSurfacedInSession = new Set());
      let ed: any = ec.memoriesSurfacedInSession,
        ep: any = await this.memoryRelevanceService.selectRelevantMemories(
          eA,
          el,
          void 0,
          ed,
          eu,
        );
      if (0 === ep.length) return "";
      for (let eA of ep) ed.add(eA.path);
      let eg: any = [];
      for (let eA of ep)
        try {
          let el: any = await (0, this.runtime.fsPromises.readFile)(
              eA.path,
              "utf-8",
            ),
            ec: any = (0, this.runtime.freshness.memoryAge)(eA.mtimeMs),
            eu: any = (0, this.runtime.freshness.memoryFreshnessText)(
              eA.mtimeMs,
            ),
            ed: any = eA.path.split("/").pop() || eA.path,
            ep: any = `### ${ed} (${ec})

${el}`;
          (eu &&
            (ep += `

> ${eu}`),
            eg.push(ep));
        } catch (el: any) {
          this.logger.warn(
            `Skipping unreadable memory file ${eA.path}: ${el.message}`,
          );
        }
      if (0 === eg.length) return "";
      return `
## Relevant memories for this query

The following memories were automatically selected as relevant to your current task:

${eg.join("\n\n---\n\n")}`;
    } catch (eA: any) {
      return (
        this.logger.debug(`Failed to get relevant memories: ${eA.message}`),
        ""
      );
    }
  }
  extractLastUserQuery(eA: any): any {
    for (let el: any = eA.length - 1; el >= 0; el--) {
      let ec: any = eA[el];
      if ("user" === ec.role && ec.content) {
        let eA: any = "";
        if (
          ("string" == typeof ec.content
            ? (eA = ec.content)
            : Array.isArray(ec.content) &&
              (eA = ec.content
                .filter(
                  (eA: any) => "input_text" === eA.type || "text" === eA.type,
                )
                .map((eA: any) => eA.text || "")
                .join("\n")),
          !eA)
        )
          continue;
        let el: any = eA
          .replace(/<system-reminder[^>]*>[\s\S]*?<\/system-reminder>/g, "")
          .replace(/<command-name>[\s\S]*?<\/command-name>/g, "")
          .replace(
            /<local-command-stdout>[\s\S]*?<\/local-command-stdout>/g,
            "",
          )
          .replace(/<command-message>[\s\S]*?<\/command-message>/g, "")
          .trim();
        if (el) return el;
      }
    }
  }
}

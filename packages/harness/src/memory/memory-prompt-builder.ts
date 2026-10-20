import * as ed from "node:path";
export function createMemoryPromptBuilder(policy: any, runtime: any) {
  const eg = policy,
    tu = policy,
    eu = runtime.fs,
    ep = { PathUtils: { getSessionHistoryDir: runtime.getSessionHistoryDir } },
    console = { warn: runtime.warn },
    eh =
      "This directory already exists — write to it directly with the Write tool (do not run mkdir or check for its existence).";
  function truncateEntrypointContent(eA: any): any {
    let el: any = eA.trim(),
      ec: any = el.split("\n"),
      eu: any = ec.length,
      ed: any = el.length,
      ep: any = eu > eg.MAX_ENTRYPOINT_LINES,
      eh: any = ed > eg.MAX_ENTRYPOINT_BYTES;
    if (!ep && !eh)
      return {
        content: el,
        lineCount: eu,
        charCount: ed,
        wasLineTruncated: ep,
        wasCharTruncated: eh,
      };
    let ef: any = ep ? ec.slice(0, eg.MAX_ENTRYPOINT_LINES).join("\n") : el;
    if (ef.length > eg.MAX_ENTRYPOINT_BYTES) {
      let eA: any = ef.lastIndexOf("\n", eg.MAX_ENTRYPOINT_BYTES);
      ef = ef.slice(0, eA > 0 ? eA : eg.MAX_ENTRYPOINT_BYTES);
    }
    let em: any = [];
    return (
      ep && em.push(`${eu} lines (limit: ${eg.MAX_ENTRYPOINT_LINES})`),
      eh && em.push(`${ed} chars (limit: ${eg.MAX_ENTRYPOINT_BYTES})`),
      {
        content:
          ef +
          `

> WARNING: ${eg.ENTRYPOINT_NAME} is ${em.join(" and ")}. Only part of it was loaded. Keep index entries to one line under ~200 chars; move detail into topic files.`,
        lineCount: eu,
        charCount: ed,
        wasLineTruncated: ep,
        wasCharTruncated: eh,
      }
    );
  }
  function buildSearchingPastContextSection(eA: any, el: any): any {
    let ec: any = ep.PathUtils.getSessionHistoryDir(el);
    return [
      "## Searching past context",
      "",
      "When looking for past context:",
      "1. Search topic files in your memory directory:",
      "```",
      `Grep with pattern="<search term>" path="${eA}" glob="*.md"`,
      "```",
      "2. Session transcript logs (last resort — large files, slow):",
      "```",
      `Grep with pattern="<search term>" path="${ec}/" glob="*.jsonl"`,
      "```",
      "Use narrow search terms (error messages, file paths, function names) rather than broad keywords.",
      "",
    ];
  }
  function buildMemoryLines(eA: any, el: any, ec: any, eu: any): any {
    let ed: any = [
        "## How to save memories",
        "",
        "Saving a memory is a two-step process:",
        "",
        "**Step 1** — write the memory to its own file (e.g., `user_role.md`, `feedback_testing.md`) using this frontmatter format:",
        "",
        ...eg.MEMORY_FRONTMATTER_EXAMPLE,
        "",
        `**Step 2** — add a pointer to that file in \`${eg.ENTRYPOINT_NAME}\`. \`${eg.ENTRYPOINT_NAME}\` is an index, not a memory — each entry should be one line, under ~150 characters: \`- [Title](file.md) — one-line hook\`. It has no frontmatter. Never write memory content directly into \`${eg.ENTRYPOINT_NAME}\`.`,
        "",
        `- \`${eg.ENTRYPOINT_NAME}\` is always loaded into your conversation context — lines after ${eg.MAX_ENTRYPOINT_LINES} will be truncated, so keep the index concise`,
        "- Keep the name, description, and type fields in memory files up-to-date with the content",
        "- Organize memory semantically by topic, not chronologically",
        "- Update or remove memories that turn out to be wrong or outdated",
        "- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.",
      ],
      ep: any = [
        `# ${eA}`,
        "",
        `You have a persistent, file-based memory system at \`${el}\`. ${eh}`,
        "",
        "You should build up this memory system over time so that future conversations can have a complete picture of who the user is, how they'd like to collaborate with you, what behaviors to avoid or repeat, and the context behind the work the user gives you.",
        "",
        "If the user explicitly asks you to remember something, save it immediately as whichever type fits best. If they ask you to forget something, find and remove the relevant entry.",
        "",
        ...eg.TYPES_SECTION_INDIVIDUAL,
        ...eg.WHAT_NOT_TO_SAVE_SECTION,
        "",
        ...ed,
        "",
        ...eg.WHEN_TO_ACCESS_SECTION,
        "",
        ...eg.TRUSTING_RECALL_SECTION,
        "",
        "## Memory and other forms of persistence",
        "Memory is one of several persistence mechanisms available to you as you assist the user in a given conversation. The distinction is often that memory can be recalled in future conversations and should not be used for persisting information that is only useful within the scope of the current conversation.",
        "- When to use or update a plan instead of memory: If you are about to start a non-trivial implementation task and would like to reach alignment with the user on your approach you should use a Plan rather than saving this information to memory. Similarly, if you already have a plan within the conversation and you have changed your approach persist that change by updating the plan rather than saving a memory.",
        "- When to use or update tasks instead of memory: When you need to break your work in current conversation into discrete steps or keep track of your progress use tasks instead of saving to memory. Tasks are great for persisting information about the work that needs to be done in the current conversation, but memory should be reserved for information that will be useful in future conversations.",
        "",
        ...(eu ?? []),
        "",
      ];
    return (ep.push(...buildSearchingPastContextSection(el, ec)), ep);
  }
  function buildMemoryPrompt(eA: any): any {
    let {
        displayName: el,
        memoryDir: ec,
        projectId: ep,
        extraGuidelines: eh,
      } = eA,
      ef: any = (0, ed.join)(ec, eg.ENTRYPOINT_NAME),
      em: any = "";
    try {
      (0, eu.existsSync)(ef) && (em = (0, eu.readFileSync)(ef, "utf-8"));
    } catch (eA: any) {
      console.warn(
        `[MemoryPromptBuilder] Failed to read ${ef}: ${eA instanceof Error ? eA.message : String(eA)}`,
      );
    }
    let eE: any = buildMemoryLines(el, ec, ep, eh);
    if (em.trim()) {
      let eA: any = truncateEntrypointContent(em);
      eE.push(`## ${eg.ENTRYPOINT_NAME}`, "", eA.content);
    } else
      eE.push(
        `## ${eg.ENTRYPOINT_NAME}`,
        "",
        `Your ${eg.ENTRYPOINT_NAME} is currently empty. When you save new memories, they will appear here.`,
      );
    return eE.join("\n");
  }
  function memory_extraction_prompts_opener(eA: any, el: any): any {
    return [
      `You are now acting as the memory extraction subagent. Analyze the most recent ~${eA} messages above and use them to update your persistent memory systems.`,
      "\nCRITICAL: You MUST use the Write and Edit tools to save memories. Do NOT describe what you would save in plain text — actually call the tools. A response with only text and no tool calls means nothing was saved and your work is wasted.\n\nIf there is nothing worth saving from the recent messages, respond with exactly: NO_EXTRACTION_NEEDED\n\nAvailable tools: Read, Grep, Glob (unrestricted read-only), and Write/Edit for paths inside the memory directory ONLY. You MUST NOT write to any path outside the memory directory. All other tools are not available.\n\nYou have a limited turn budget. The efficient strategy is: turn 1 — issue all Read calls in parallel for every file you might update; turn 2 — issue all Write/Edit calls in parallel. Do not interleave reads and writes across multiple turns.\n",
      `You MUST only use content from the last ~${eA} messages to update your persistent memories. Do not waste any turns attempting to investigate or verify that content further — no grepping source files, no reading code to confirm a pattern exists, no git commands.` +
        (el.length > 0
          ? `

## Existing memory files

${el}

Check this list before writing — update an existing file rather than creating a duplicate.`
          : ""),
    ].join("\n");
  }
  function buildExtractPrompt(eA: any, el: any): any {
    let ec: any = [
      "## How to save memories",
      "",
      "Saving a memory is a two-step process:",
      "",
      "**Step 1** — write the memory to its own file (e.g., `user_role.md`, `feedback_testing.md`) using this frontmatter format:",
      "",
      ...tu.MEMORY_FRONTMATTER_EXAMPLE,
      "",
      "**Step 2** — add a pointer to that file in `MEMORY.md`. `MEMORY.md` is an index, not a memory — each entry should be one line, under ~150 characters: `- [Title](file.md) — one-line hook`. It has no frontmatter. Never write memory content directly into `MEMORY.md`.",
      "",
      "- `MEMORY.md` is always loaded into your system prompt — lines after 200 will be truncated, so keep the index concise",
      "- Organize memory semantically by topic, not chronologically",
      "- Update or remove memories that turn out to be wrong or outdated",
      "- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.",
    ];
    return [
      memory_extraction_prompts_opener(eA, el),
      "",
      "If the user explicitly asks you to remember something, save it immediately as whichever type fits best. If they ask you to forget something, find and remove the relevant entry.",
      "",
      ...tu.TYPES_SECTION_INDIVIDUAL,
      ...tu.WHAT_NOT_TO_SAVE_SECTION,
      "",
      ...ec,
    ].join("\n");
  }
  return {
    truncateEntrypointContent,
    buildMemoryLines,
    buildMemoryPrompt,
    buildExtractPrompt,
    memory_extraction_prompts_opener,
  };
}

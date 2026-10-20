// Original per-tool presentation metadata. No schema/config/prompt changes.
export function redactPowerShellCommand(eA: any): any {
  return eA
    .replace(
      /((?:echo\s+(?:-n\s+)?)?["'][^"']+["']\s*\|\s*[^\r\n;]*--token-stdin\b)/gi,
      (eA: any) => eA.replace(/(["'])[^"']+\1/, "$1[REDACTED]$1"),
    )
    .replace(
      /(\$env:BUDDY_CLOUD_TOKEN\s*=\s*)(?:"[^"]*"|'[^']*'|[^;\r\n]+)/gi,
      '$1"[REDACTED]"',
    )
    .replace(
      /(\bBUDDY_CLOUD_TOKEN\s*=\s*)(?:"[^"]*"|'[^']*'|[^;\r\n]+)/gi,
      '$1"[REDACTED]"',
    )
    .replace(/(\s-Token\s+)(?:"[^"]*"|'[^']*'|\S+)/gi, "$1[REDACTED]");
}
const c9 = { redactPowerShellCommand };
export const nativeToolArgumentRenderers: Record<
  string,
  {
    displayProperties?: Array<{ name: string; type?: string }>;
    formatText?: (input: any) => any;
  }
> = {
  AskUserQuestion: { displayProperties: [] }, // UTF-16 11501231..11501253
  ToolSearch: {
    formatText: (eA: any) => {
      let el: any = [],
        ec: any = Array.isArray(eA.queries)
          ? eA.queries.filter(
              (eA: any) => "string" == typeof eA && eA.length > 0,
            )
          : void 0,
        eu: any = Array.isArray(eA.tool_names)
          ? eA.tool_names.filter(
              (eA: any) => "string" == typeof eA && eA.length > 0,
            )
          : void 0;
      return (
        ec &&
          ec.length > 0 &&
          el.push(
            `queries: [${ec.map((eA: any) => JSON.stringify(eA)).join(", ")}]`,
          ),
        eu &&
          eu.length > 0 &&
          el.push(
            `tool_names: [${eu.map((eA: any) => JSON.stringify(eA)).join(", ")}]`,
          ),
        "number" == typeof eA.top_k &&
          3 !== eA.top_k &&
          el.push(`top_k: ${eA.top_k}`),
        el.length > 0 ? el.join(", ") : void 0
      );
    },
  }, // UTF-16 11612227..11612727
  Read: { displayProperties: [{ type: "path", name: "file_path" }] }, // UTF-16 11688932..11688984
  Write: { displayProperties: [{ type: "path", name: "file_path" }] }, // UTF-16 11734232..11734284
  Edit: { displayProperties: [{ type: "path", name: "file_path" }] }, // UTF-16 11740498..11740550
  Bash: { displayProperties: [{ name: "command" }] }, // UTF-16 11758768..11758806
  Glob: {
    displayProperties: [{ name: "pattern" }, { type: "path", name: "path" }],
  }, // UTF-16 11788290..11788354
  Grep: {
    displayProperties: [
      { name: "pattern" },
      { type: "path", name: "path" },
      { name: "glob" },
    ],
  }, // UTF-16 11794811..11794889
  TodoWrite: { displayProperties: [] }, // UTF-16 11804646..11804668
  WebFetch: { displayProperties: [{ type: "url", name: "url" }] }, // UTF-16 11809395..11809440
  WebSearch: { displayProperties: [{ name: "query" }] }, // UTF-16 11827633..11827669
  MultiEdit: { displayProperties: [{ type: "path", name: "file_path" }] }, // UTF-16 11834163..11834215
  NotebookRead: {
    displayProperties: [{ type: "path", name: "notebook_path" }],
  }, // UTF-16 11839001..11839057
  NotebookEdit: {
    displayProperties: [{ type: "path", name: "notebook_path" }],
  }, // UTF-16 11845245..11845301
  Agent: {
    displayProperties: [{ name: "subagent_type" }, { name: "description" }],
  }, // UTF-16 11855610..11855675
  TaskOutput: { displayProperties: [{ name: "task_id" }] }, // UTF-16 11871595..11871633
  TaskCreate: { displayProperties: [] }, // UTF-16 11878970..11878992
  TaskGet: { displayProperties: [{ name: "taskId" }] }, // UTF-16 11882846..11882883
  TaskUpdate: { displayProperties: [] }, // UTF-16 11886420..11886442
  TaskList: { displayProperties: [] }, // UTF-16 11889992..11890014
  EnterPlanMode: { displayProperties: [] }, // UTF-16 11893843..11893865
  ExitPlanMode: { displayProperties: [] }, // UTF-16 11898386..11898408
  SlashCommand: { displayProperties: [{ name: "command" }] }, // UTF-16 11914334..11914372
  Skill: { displayProperties: [{ name: "skill" }] }, // UTF-16 11919674..11919710
  SkillManage: { displayProperties: [{ name: "action" }, { name: "name" }] }, // UTF-16 11929825..11929876
  StructuredOutput: { displayProperties: [] }, // UTF-16 11999835..11999857
  DeferExecuteTool: { displayProperties: [{ name: "toolName" }] }, // UTF-16 12008579..12008618
  SendMessage: {
    displayProperties: [
      { name: "type" },
      { name: "recipient" },
      { name: "summary" },
    ],
  }, // UTF-16 12047099..12047170
  CronCreate: {
    displayProperties: [{ name: "cron" }, { name: "prompt" }],
    formatText: (eA: any) => {
      let el: any = eA.cron || "",
        ec: any = eA.prompt || "";
      return `${el}: ${ec.slice(0, 60)}`;
    },
  }, // UTF-16 12061759..12061896
  CronDelete: { displayProperties: [{ name: "id" }] }, // UTF-16 12064370..12064403
  CronList: { displayProperties: [] }, // UTF-16 12065866..12065888
  PowerShell: {
    formatText: (eA: any) =>
      (0, c9.redactPowerShellCommand)(String(eA.command || "")),
    displayProperties: [{ name: "command" }],
  }, // UTF-16 12109592..12109700
  ListMcpResources: { displayProperties: [{ name: "server" }] }, // UTF-16 12153372..12153409
  ReadMcpResource: { displayProperties: [{ name: "server" }, { name: "uri" }] }, // UTF-16 12156207..12156257
  WaitForMcpServers: { displayProperties: [{ name: "servers" }] }, // UTF-16 12160703..12160741
  Workflow: {
    displayProperties: [{ name: "name" }, { name: "scriptPath" }],
    formatText: (eA: any) => {
      let el: any = "string" == typeof eA.name ? eA.name : void 0,
        ec: any = "string" == typeof eA.scriptPath ? eA.scriptPath : void 0;
      return el
        ? `saved workflow: ${el}`
        : ec
          ? `script: ${ec}`
          : "dynamic workflow";
    },
  }, // UTF-16 12165937..12166183
  TeamCreate: { displayProperties: [{ name: "team_name" }] }, // UTF-16 12185854..12185894
};

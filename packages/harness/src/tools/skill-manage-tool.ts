import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { extractFrontMatterWithContent } from "../memory/memory-store.js";
import type { ProductSkill } from "../commands/types.js";
import type { ToolManager } from "./tool-manager.js";

export const SKILL_REGISTRY_FILENAME = "agent-created-skills.json";
export const SKILL_MANAGE_MAX_OUTPUT = 30_000;
export const skillManageParameters = z.object({
  action: z.enum(["list", "create", "modify", "delete"]).describe("Action type: list all skills, create a new skill, modify an existing skill, or delete a skill"),
  name: z.string().optional().describe("Skill name. Required for create/modify/delete actions. Not needed for list."),
});
export type SkillManageInput = z.infer<typeof skillManageParameters>;
export type SkillManageResult = { content: string; error?: string };
export type SkillRegistry = { skills: Array<{ name: string; createdAt?: string; skillDir?: string }>; [key: string]: unknown };
/** Source 11929601..11938484: guidance only. Files and registry are never modified here. */
export class SkillManageTool {
  readonly name = "SkillManage";
  readonly parameters = skillManageParameters;
  readonly needsApproval = false;
  constructor(private readonly configuration: () => Promise<{ skills?: readonly ProductSkill[]; productFeatures?: Record<string, unknown> }>,
    private readonly homeSkillsDir: () => string, private readonly logger: { error(message: string): void; debug(message: string, error?: unknown): void } = { error() {}, debug() {} }) {}
  async isEnabled(): Promise<boolean> { return (await this.configuration()).productFeatures?.SkillManage as boolean ?? false; }
  async execute(input: SkillManageInput): Promise<SkillManageResult> {
    const { action, name } = input;
    try {
      switch (action) {
        case "list": return this.handleList();
        case "create": return this.handleCreate(name);
        case "modify": return this.handleModify(name);
        case "delete": return this.handleDelete(name);
        default: return { content: `Error: Unknown action "${action}". Supported actions: list, create, modify, delete.` };
      }
    } catch (error) { const message = error instanceof Error ? error.message : String(error); this.logger.error(`SkillManage ${action} failed: ${message}`); return { content: `Error: ${message}`, error: message }; }
  }
  async handleList(): Promise<SkillManageResult> {
    const skills = (await this.configuration()).skills || [], registered = new Set(this.readRegistry().skills.map((skill) => skill.name));
    if (!skills.length) return { content: "No skills available." };
    const shown = skills.slice(0, 30), rest = skills.slice(30), lines = [`Available skills (${skills.length}):`, ""];
    for (const skill of shown) { const created = skill.agentCreated === true || registered.has(skill.name); lines.push(`- ${skill.name}${created ? " [agent_created]" : ""}`, `  Description : ${skill.description || "(no description)"}`, `  Path        : ${skill.location}`, ""); }
    if (rest.length) { lines.push(`Other skills (${rest.length}, names only):`); for (const skill of rest) lines.push(`- ${skill.name}${skill.agentCreated === true || registered.has(skill.name) ? " [agent_created]" : ""}`); lines.push(""); }
    return { content: this.truncateOutput(lines.join("\n")) };
  }
  handleCreate(name?: string): SkillManageResult {
    this.checkLegacyNameType(name);
    if (!name?.trim()) return { content: 'Error: "name" parameter is required for create action.' };
    name = name.trim(); const root = this.homeSkillsDir(), directory = join(root, name), filename = join(directory, "SKILL.md"), registry = join(root, SKILL_REGISTRY_FILENAME);
    if (existsSync(directory)) return { content: `Error: Cannot create skill "${name}".\nA skill with this name already exists at ${directory}/.\nTo update it, use skill_manage(action="modify", name="${name}").\nTo replace it, delete it first with skill_manage(action="delete", name="${name}"), then create again.` };
    return { content: [`Skill directory : ${directory}`, `SKILL.md path   : ${filename}`, "\nSKILL.md template:", this.generateSkillTemplate(name),
      "\nSupporting directories (create as needed):\n  references/   Long-form docs, API references, background material — reference with @references/xxx.md in the body\n  scripts/      Executable scripts (.py, .sh, .js) the skill instructs the model to run\n  templates/    Output templates for structured results\n  assets/       Static files (icons, fonts, data files)\n\nWorkflow:\n1. Use the Write tool to create SKILL.md at the path above. Fill in every section — do not leave placeholder text.\n2. SKILL.md MUST start with YAML frontmatter. Both name and description are required.\n   description is the primary signal the model uses to identify and load this skill — make it specific and accurate.\n   description_zh / description_en are short UI labels, kept separate from description.\n   agent-created: true MUST be preserved — it marks this skill as model-created. Without it, this tool will no longer be able to modify the skill.\n3. A good skill includes: clear trigger conditions, numbered steps with exact commands, a Pitfalls section, and a verification step.\n4. If the skill needs reference docs or scripts, create them under the appropriate subdirectory and reference them from the SKILL.md body.\n5. If the skill contains executable scripts or makes external network calls, run the security-scan skill on the skill directory after creation.\n6. Update the registry file to register this skill:",
      `   - Read \`${registry}\` (create if not exists)`, `   - Add entry: { "name": "${name}", "createdAt": "<ISO timestamp>", "skillDir": "${name}" }`, `   - Write the updated JSON back to \`${registry}\``].join("\n") };
  }
  async handleModify(name?: string): Promise<SkillManageResult> {
    this.checkLegacyNameType(name);
    if (!name?.trim()) return { content: 'Error: skill name is required.\nUsage: skill_manage(action="modify", name="<skill-name>")' };
    name = name.trim(); const skill = this.findSkillByName((await this.configuration()).skills, name);
    if (!skill) return { content: `Error: No skill named "${name}" found.\nUse skill_manage(action="list") to see all available skills.\nTo create a new one, use skill_manage(action="create", name="${name}").` };
    const error = this.validateAgentCreated(name, skill.location!, "modify"); if (error) return { content: error };
    return { content: this.truncateOutput([`Skill directory : ${skill.baseDirectory}`, "\nFiles:", this.listDirectoryContents(skill.baseDirectory!),
      "\nWorkflow:\n1. Use the Read tool to read the files you need to understand before editing.\n2. Use the Edit tool to modify files.\n3. SKILL.md MUST start with YAML frontmatter. The name, description, and agent_created fields must not be removed or renamed.\n4. If you discovered a new pitfall or edge case, add it to the Pitfalls section.\n5. If the changes involve executable scripts or external network calls, run the security-scan skill on the skill directory after editing."].join("\n")) };
  }
  async handleDelete(name?: string): Promise<SkillManageResult> {
    this.checkLegacyNameType(name);
    if (!name?.trim()) return { content: 'Error: skill name is required.\nUsage: skill_manage(action="delete", name="<skill-name>")' };
    name = name.trim(); const skill = this.findSkillByName((await this.configuration()).skills, name);
    if (!skill) return { content: `Error: No skill named "${name}" found.\nUse skill_manage(action="list") to see all available skills.` };
    const error = this.validateAgentCreated(name, skill.location!, "delete"); if (error) return { content: error };
    const registry = join(this.homeSkillsDir(), SKILL_REGISTRY_FILENAME);
    return { content: `Skill directory : ${skill.baseDirectory}\n\nWorkflow:\n1. Confirm with the user before proceeding.\n2. Use Bash to run: rm -rf "${skill.baseDirectory}"\n3. Update the registry file:\n   - Read \`${registry}\`\n   - Remove the entry with name "${name}"\n   - Write the updated JSON back to \`${registry}\`` };
  }
  readRegistry(): SkillRegistry {
    try { const filename = join(this.homeSkillsDir(), SKILL_REGISTRY_FILENAME); if (!existsSync(filename)) return { skills: [] }; const value = JSON.parse(readFileSync(filename, "utf8")); return value && Array.isArray(value.skills) ? value : { skills: [] }; }
    catch (error) { this.logger.debug("Failed to read skill registry file", error); return { skills: [] }; }
  }
  isInRegistry(name: string): boolean { return this.readRegistry().skills.some((skill) => skill.name === name); }
  hasAgentCreatedFrontmatter(filename: string): boolean { try { return existsSync(filename) && extractFrontMatterWithContent(readFileSync(filename, "utf8")).data.agent_created === true; } catch { return false; } }
  validateAgentCreated(name: string, filename: string, action = "modify"): string | undefined {
    const registered = this.isInRegistry(name), frontmatter = this.hasAgentCreatedFrontmatter(filename);
    if (registered || frontmatter) return;
    return action === "modify" ? `Error: skill "${name}" was not created by the model and cannot be modified by this tool.\nOnly skills with agent_created: true in their frontmatter are in scope.\nMarketplace, built-in, and plugin-provided skills are not supported.`
      : `Error: skill "${name}" was not created by the model and cannot be deleted by this tool.\nOnly skills with agent_created: true in their frontmatter are in scope.\nMarketplace, built-in, and plugin-provided skills should be managed through the skill marketplace or settings.`;
  }
  findSkillByName(skills: readonly ProductSkill[] | undefined, name: string): ProductSkill | undefined {
    if (!skills?.length) return;
    const exact = skills.find((skill) => skill.name === name); if (exact) return exact;
    if (!name.includes(":")) { const matches = skills.filter((skill) => (skill.name.includes(":") ? skill.name.split(":").pop() : skill.name) === name); if (matches.length === 1) return matches[0]; }
  }
  listDirectoryContents(directory: string, indent = "  "): string {
    try {
      if (!existsSync(directory)) return `${indent}(directory not found)`;
      const entries = readdirSync(directory); if (!entries.length) return `${indent}(empty directory)`;
      const lines: string[] = []; let count = 0;
      for (const name of entries) {
        if (count >= 100) { lines.push(`${indent}... [${entries.length - count} more entries not shown] ...`); break; }
        const filename = join(directory, name);
        try {
          if (statSync(filename).isDirectory()) { const children = readdirSync(filename); for (const child of children) { if (count >= 100) { lines.push(`${indent}... [more entries not shown] ...`); return lines.join("\n"); } lines.push(`${indent}${name}/${child}`); count++; } if (!children.length) { lines.push(`${indent}${name}/`); count++; } }
          else { lines.push(`${indent}${name}`); count++; }
        } catch { lines.push(`${indent}${name}`); count++; }
      }
      return lines.join("\n");
    } catch { return `${indent}(failed to read directory)`; }
  }
  generateSkillTemplate(name: string): string { return `---\nname: ${name}\ndescription: <detailed description loaded into model context — explain purpose, trigger conditions, and usage clearly>\ndescription_zh: <short Chinese label for UI display only, e.g. "提交代码变更">\ndescription_en: <short English label for UI display only, e.g. "Commit code changes">\ndisable: false\nagent_created: true\n---\n\n# ${name}\n\n## When to use\n<exact situations that should trigger this skill>\n\n## Steps\n1.\n2.\n\n## Pitfalls\n-\n\n## Verification\n-`; }
  private checkLegacyNameType(name: unknown): void { if (name && typeof (name as any).trim !== "function") throw new TypeError("eA.trim is not a function"); }
  truncateOutput(content: string): string { return content.length <= SKILL_MANAGE_MAX_OUTPUT ? content : content.substring(0, SKILL_MANAGE_MAX_OUTPUT) + `\n... [output truncated after ${SKILL_MANAGE_MAX_OUTPUT} characters] ...`; }
  register(manager: ToolManager): void { manager.register(this.name, { parameters: this.parameters, parseInput: false, needsApproval: this.needsApproval, isEnabled: () => this.isEnabled(), execute: (input) => this.execute(input as SkillManageInput) }); }
}

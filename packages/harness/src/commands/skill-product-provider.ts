import { access, readdir, readFile, stat } from "node:fs/promises";
import type { Dirent } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { extractFrontMatterWithContent } from "../memory/memory-store.js";
import type { ProductSkill } from "./types.js";

export const MAX_SKILL_SCAN_DEPTH = 5;
export function deriveSkillVisibility(data: Record<string, any>): { disableModelInvocation: boolean | undefined; userInvocable: boolean | undefined } {
  return { disableModelInvocation: data["disable-model-invocation"] ?? (data.disable === true || undefined), userInvocable: data["user-invocable"] };
}
export function deriveSkillNameFromPath(filename: string, root?: string): string { const directory = dirname(filename); return (root ? relative(root, directory).split(sep).filter(Boolean) : []).join(":") || basename(directory); }
export function replaceBrandName(text: string): string { const brand = process.env.CODEBUDDY_BRAND_NAME || "WorkBuddy", lower = brand.toLowerCase(); return text.replace(/CodeBuddy/g, brand).replace(/\.codebuddy/g, `.${lower}`).replace(/codebuddy/g, lower); }
export function substituteLoadTimeVariables(text: string, filename: string, pluginRoot?: string): string {
  const normalize = (value: string) => process.platform === "win32" ? value.replace(/\\/g, "/") : value;
  let content = text;
  if (pluginRoot) content = content.replace(/\$\{CODEBUDDY_PLUGIN_ROOT\}/g, normalize(pluginRoot)).replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, normalize(pluginRoot));
  content = content.replace(/\$\{CODEBUDDY_SKILL_DIR\}/g, normalize(dirname(filename))).replace(/\$\{CLAUDE_SKILL_DIR\}/g, normalize(dirname(filename)));
  const replacements = new Map<string, string>();
  ["CODEBUDDY_SESSION_ID", "CLAUDE_SESSION_ID"].forEach((name, index) => { const variable = `\${${name}}`; if (content.includes(variable)) { const marker = `\u0000__CBC_RT_${index}__\u0000`; replacements.set(marker, variable); content = content.split(variable).join(marker); } });
  content = content.replace(/\$\{([A-Z_][A-Z0-9_]*)(?::-(.*?))?\}/g, (match, name: string, fallback: string | undefined) => process.env[name] ?? fallback ?? match);
  for (const [marker, variable] of replacements) content = content.split(marker).join(variable);
  return content;
}
export function parseListField(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((entry) => entry.trim()).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  const result: string[] = []; let current = "", depth = 0;
  for (const character of value) {
    if (character === "{") { depth++; current += character; }
    else if (character === "}") { depth = Math.max(0, depth - 1); current += character; }
    else if (character === "," && depth === 0) { if (current.trim()) result.push(current.trim()); current = ""; }
    else current += character;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}
export function generateSkillColor(name: string, dark = true): string | undefined {
  if (!name) return;
  let hash = 0; for (let index = 0; index < name.length; index++) { hash = (hash << 5) - hash + name.charCodeAt(index); hash &= hash; }
  return "#" + [hash, hash >> 8, hash >> 16].map((value) => (dark ? Math.abs(value) % 136 + 120 : Math.abs(value) % 120).toString(16).padStart(2, "0")).join("");
}
export type SkillProviderPaths = { project: string; user: string; connector: string; builtin?: string; seedSnapshots?: () => Promise<readonly { category: string; snapshotDir: string }[]>; darkTheme?: () => boolean };
/** Workspace provider 9921736..9926463. Root paths and bundled seed snapshots belong to the host. */
export class SkillProductProvider {
  readonly volatile = true;
  private skillsCache: ProductSkill[] | undefined;
  private skillsLoading: Promise<ProductSkill[]> | undefined;
  constructor(private readonly paths: SkillProviderPaths, private readonly logger: { debug(message: string, error?: unknown): void } = { debug() {} }) {}
  clearCache(): void { this.skillsCache = undefined; this.skillsLoading = undefined; }
  async provide(options?: { force?: boolean }): Promise<{ skills?: ProductSkill[]; mergeStrategy?: string }> {
    try { if (options?.force) this.clearCache(); return { mergeStrategy: "smartMerge", skills: await this.loadSkillsCached() }; }
    catch (error) { this.logger.debug("Failed to load skills", error); return {}; }
  }
  async loadSkillsCached(): Promise<ProductSkill[]> {
    if (this.skillsCache) return this.cloneSkills(this.skillsCache);
    if (this.skillsLoading) return this.cloneSkills(await this.skillsLoading);
    this.skillsLoading = this.loadSkills();
    try { this.skillsCache = await this.skillsLoading; return this.cloneSkills(this.skillsCache); } finally { this.skillsLoading = undefined; }
  }
  async loadSkills(): Promise<ProductSkill[]> {
    const skills: ProductSkill[] = [], seen = new Set<string>();
    for (const [directory, source] of [[this.paths.project, "project"], [this.paths.user, "user"], [this.paths.connector, "connector"], [process.env.CODEBUDDY_SESSION_SKILL_DIRS, "project"]] as const)
      if (directory && await this.pathExists(directory)) skills.push(...await this.scanSkillsDirectory(directory, source, seen));
    skills.push(...await this.loadBundledSkills(skills, seen));
    return skills;
  }
  async loadBundledSkills(existing: ProductSkill[], seen: Set<string>): Promise<ProductSkill[]> {
    const loaded: ProductSkill[] = [], names = new Set(existing.map((skill) => skill.name));
    const append = (skills: ProductSkill[]) => { for (const skill of skills) if (!names.has(skill.name)) { names.add(skill.name); loaded.push(skill); } };
    for (const snapshot of await this.paths.seedSnapshots?.() ?? []) if (snapshot.category === "skill") append(await this.scanSkillsDirectory(snapshot.snapshotDir, "bundled", seen));
    if (this.paths.builtin && await this.pathExists(this.paths.builtin)) append(await this.scanSkillsDirectory(this.paths.builtin, "bundled", seen));
    return loaded;
  }
  async pathExists(directory: string): Promise<boolean> { try { await access(directory); return true; } catch { return false; } }
  cloneSkills(skills: ProductSkill[]): ProductSkill[] { return skills.map((skill) => ({ ...skill, allowedTools: skill.allowedTools ? [...skill.allowedTools] : undefined })); }
  getSkillLoadConcurrency(): number { const parsed = parseInt(process.env.CODEBUDDY_SKILL_LOAD_CONCURRENCY ?? "", 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : 32; }
  async scanSkillsDirectory(directory: string, source: string, seen: Set<string>, root = directory, depth = 0): Promise<ProductSkill[]> {
    const skills: ProductSkill[] = [];
    if (depth > MAX_SKILL_SCAN_DEPTH) return skills;
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      for (const entry of entries) { const filename = join(directory, entry.name); if (await this.isFileEntry(filename, entry) && entry.name === "SKILL.md" && !seen.has(filename)) try { const skill = await this.parseSkillFile(filename, root, source); if (skill) { skills.push(skill); seen.add(filename); } } catch (error) { this.logger.debug(`Failed to parse skill file ${filename}`, error); } }
      const results: ProductSkill[][] = Array(entries.length); let cursor = 0;
      await Promise.all(Array.from({ length: Math.min(entries.length, this.getSkillLoadConcurrency()) }, async () => { for (;;) { const index = cursor++; if (index >= entries.length) return; const entry = entries[index]!, filename = join(directory, entry.name); results[index] = await this.isDirectoryEntry(filename, entry) ? await this.scanSkillsDirectory(filename, source, seen, root, depth + 1) : []; } }));
      for (const result of results) skills.push(...result);
    } catch (error) { this.logger.debug(`Failed to scan directory ${directory}`, error); }
    return skills;
  }
  async isDirectoryEntry(filename: string, entry: Dirent): Promise<boolean> { if (entry.isDirectory()) return true; if (!entry.isSymbolicLink()) return false; try { return (await stat(filename)).isDirectory(); } catch { return false; } }
  async isFileEntry(filename: string, entry: Dirent): Promise<boolean> { if (entry.isFile()) return true; if (!entry.isSymbolicLink()) return false; try { return (await stat(filename)).isFile(); } catch { return false; } }
  async parseSkillFile(filename: string, root: string, source: string): Promise<ProductSkill | undefined> {
    try {
      const { data, content } = extractFrontMatterWithContent(await readFile(filename, "utf8")), fields = data as Record<string, any>;
      const visibility = deriveSkillVisibility(fields), directory = dirname(filename), name = fields.name || deriveSkillNameFromPath(filename, root);
      let displayName = fields.display_name || fields["display-name"] || undefined, skillId: string | undefined, skillVersion: string | undefined;
      const candidates = ["_skillhub_meta.json", "_knot_meta.json", "_user_meta.json", "_marketplace_meta.json"].flatMap((name) => [join(directory, name), join(dirname(directory), name)]);
      for (const candidate of candidates) try {
        await access(candidate); const metadata = JSON.parse(await readFile(candidate, "utf8"));
        if (!displayName && metadata.name && metadata.name !== name) displayName = metadata.name;
        if (!skillId) { if (typeof metadata.skillId === "string" && metadata.skillId) skillId = metadata.skillId; else if (typeof metadata.slug === "string" && metadata.slug) skillId = metadata.slug; }
        if (!skillVersion && typeof metadata.version === "string" && metadata.version) skillVersion = metadata.version;
        break;
      } catch {}
      let description = fields.description || name; const sourceTag = `(${source})`; if (!description.includes(sourceTag)) description += ` ${sourceTag}`;
      const allowed = parseListField(fields["allowed-tools"]), bundled = source === "bundled", instructions = substituteLoadTimeVariables(content.trim(), filename);
      return { name, displayName, skillId, skillVersion, description: bundled ? replaceBrandName(description) : description, instructions: bundled ? replaceBrandName(instructions) : instructions,
        baseDirectory: directory, allowedTools: allowed.length ? allowed : undefined, source, location: filename, color: generateSkillColor(name, this.paths.darkTheme?.() ?? true), ...visibility,
        context: fields.context, agent: fields.agent, model: fields.model, agentCreated: fields.agent_created === true || undefined };
    } catch (error) { this.logger.debug(`Failed to parse skill file ${filename}`, error); return undefined; }
  }
}

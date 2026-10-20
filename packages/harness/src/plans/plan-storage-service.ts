import { access, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { HarnessSession } from "../sessions/session.js";

export class PlanModeUtils {
  static generateUniquePlanFileName(): string {
    const adjectives = ["toasty", "blazing", "swift", "cosmic", "radiant", "stellar", "quantum", "electric"];
    const nouns = ["forging", "aurora", "thunder", "cascade", "nebula", "pulse", "vortex", "beacon"];
    const names = ["babbage", "tesla", "curie", "einstein", "newton", "darwin", "lovelace", "turing"];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${nouns[Math.floor(Math.random() * nouns.length)]}-${names[Math.floor(Math.random() * names.length)]}.md`;
  }
  static generatePlanFilePath(plansDirectory: string): string { return join(plansDirectory, this.generateUniquePlanFileName()); }
}
/** module 78621. Directory creation belongs to the host/PathUtils, not write(). */
export class PlanStorageService {
  constructor(private readonly plansDirectory: string) {}
  initializePlanFilePath(session: HarnessSession): string {
    if (session.meta.planFilePath) return session.meta.planFilePath as string;
    return session.meta.planFilePath = PlanModeUtils.generatePlanFilePath(this.plansDirectory);
  }
  getPlanFilePath(session: HarnessSession): string | undefined { return session.meta.planFilePath as string | undefined; }
  async write(session: HarnessSession, content: string): Promise<void> {
    const path = this.getPlanFilePath(session);
    if (!path) throw new Error("Plan file path not initialized in session. Call initializePlanFilePath first.");
    await writeFile(path, content, "utf8");
  }
  async read(session: HarnessSession): Promise<string | undefined> {
    const path = this.getPlanFilePath(session);
    if (!path) return undefined;
    try { return await readFile(path, "utf8"); } catch { return undefined; }
  }
  syncRead(session: HarnessSession): string | undefined {
    const path = this.getPlanFilePath(session);
    if (!path) return undefined;
    try { return readFileSync(path, "utf8"); } catch { return undefined; }
  }
  async exists(session: HarnessSession): Promise<boolean> {
    const path = this.getPlanFilePath(session);
    if (!path) return false;
    try { await access(path); return true; } catch { return false; }
  }
}

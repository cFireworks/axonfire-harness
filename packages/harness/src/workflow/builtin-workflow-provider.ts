import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseMetaFromHead, type BuiltinWorkflowProvider } from "./workflow-registry.js";
export class StaticBuiltinWorkflowProvider implements BuiltinWorkflowProvider {
  private cached: Awaited<ReturnType<BuiltinWorkflowProvider["list"]>> | undefined;
  private inflight: ReturnType<BuiltinWorkflowProvider["list"]> | undefined;
  constructor(readonly rootPath: () => string) {}
  async list(): ReturnType<BuiltinWorkflowProvider["list"]> { if (this.cached) return this.cached; if (!this.inflight) this.inflight = this.discover().then((entries) => { this.cached = entries; this.inflight = undefined; return entries; }); return this.inflight; }
  async discover(): ReturnType<BuiltinWorkflowProvider["list"]> { const directory = this.rootPath(); let names; try { names = await readdir(directory); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.warn(`[BuiltinWorkflow] readdir ${directory} failed: ${String(error)}`); return []; } const entries: Awaited<ReturnType<BuiltinWorkflowProvider["list"]>> = []; for (const filename of names) { if (!filename.endsWith(".workflow.js")) continue; const scriptPath = join(directory, filename), fallback = filename.slice(0, -".workflow.js".length); let head = ""; try { head = (await readFile(scriptPath, "utf8")).slice(0, 8192); } catch (error) { console.warn(`[BuiltinWorkflow] read ${scriptPath} failed: ${String(error)}`); } const meta = parseMetaFromHead(head); entries.push({ name: meta.name ?? fallback, scriptPath, ...(meta.description !== undefined ? { description: meta.description } : {}) }); } return entries; }
}

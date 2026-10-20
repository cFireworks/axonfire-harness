import { access, readFile, stat, writeFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { z } from "zod";
import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import { ReadFileStateService } from "./read-file-state.js";
import { validateToolParameters } from "./zod-utils.js";
import type { ToolManager } from "./tool-manager.js";

export const notebookEditParameters = z.object({
  notebook_path: z.string().describe("The absolute path to the Jupyter notebook file to edit (must be absolute, not relative)"),
  cell_id: z.string().optional().describe("The ID of the cell to edit. When inserting a new cell, the new cell will be inserted after the cell with this ID, or at the beginning if not specified."),
  new_source: z.string().describe("The new source for the cell"),
  cell_type: z.enum(["code", "markdown"]).optional().describe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),
  edit_mode: z.enum(["replace", "insert", "delete"]).optional().default("replace").describe("The type of edit to make (replace, insert, delete). Defaults to replace."),
});
export type NotebookEditInput = Omit<z.infer<typeof notebookEditParameters>, "edit_mode"> & { edit_mode?: "replace" | "insert" | "delete" };
export type NotebookCell = { id?: string; cell_type: string; source: string | string[]; metadata?: Record<string, unknown>; execution_count?: unknown; outputs?: unknown[]; [key: string]: unknown };
export type NotebookFile = { cells: NotebookCell[]; nbformat: number; nbformat_minor?: number; metadata?: Record<string, unknown>; [key: string]: unknown };
export type NotebookEditRuntime = {
  successMark?: (mark: string) => string;
  reportFileAction?: (context: RunContext<HarnessSession> | undefined, filename: string, before: string, after: string, isNew: boolean) => void;
};
/** Source 11844914..11851712. No read-before-edit requirement is invented for this separate notebook handler. */
export class NotebookEditTool {
  readonly name = "NotebookEdit";
  readonly aliases = ["edit", "notebook-edit", "edit-notebook", "ipynb-edit"];
  readonly parameters = notebookEditParameters;
  constructor(readonly readFileState = new ReadFileStateService(), private readonly runtime: NotebookEditRuntime = {}) {}
  resolveNeedPermissionArgs(_context: unknown, input: NotebookEditInput): Array<{ type: string; value: string }> { return [{ type: "filePath", value: input.notebook_path }]; }
  toAutoClassifierInput(input?: Partial<NotebookEditInput>): string { const { notebook_path, edit_mode, new_source } = input ?? {}; return typeof notebook_path !== "string" ? "" : `${notebook_path} ${typeof edit_mode === "string" ? edit_mode : "replace"}: ${typeof new_source === "string" ? new_source : ""}`; }
  validateToolParams(input: NotebookEditInput): string | undefined {
    const error = validateToolParameters(this.parameters, input); if (error) return error;
    if (!input.notebook_path?.trim()) return "Notebook path cannot be empty";
    if (!isAbsolute(input.notebook_path)) return "Notebook path must be absolute, not relative";
    if (!input.notebook_path.endsWith(".ipynb")) return "File must be a Jupyter notebook (.ipynb file)";
    if (input.edit_mode === "insert" && !input.cell_type) return "cell_type is required when edit_mode is insert";
    if (input.edit_mode === "delete" && input.new_source) return "new_source should not be provided when edit_mode is delete";
  }
  async readNotebookFile(filename: string, allowCreate = false, newSource?: string): Promise<NotebookFile> {
    try {
      await access(filename); const info = await stat(filename);
      if (!info.isFile()) throw new Error(`Path is not a file: ${filename}`);
      if (info.size > 0x3200000) throw new Error(`Notebook file is too large (${Math.round(info.size / 1024 / 1024)}MB). Consider using a smaller notebook.`);
      const text = await readFile(filename, "utf8"); if (!text.length) throw new Error("Notebook file exists but has empty contents");
      let notebook: NotebookFile;
      try { notebook = JSON.parse(text); } catch (error) { throw new Error(`Invalid JSON in notebook file: ${error instanceof Error ? error.message : String(error)}`); }
      if (!notebook.cells || !Array.isArray(notebook.cells)) throw new Error("Invalid notebook format: missing or invalid cells array");
      if (typeof notebook.nbformat !== "number") throw new Error("Invalid notebook format: missing or invalid nbformat");
      return notebook;
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        if (error.code === "ENOENT") { if (allowCreate && newSource) return this.createNewNotebook(newSource); throw new Error(`Notebook file does not exist: ${filename}`); }
        if (error.code === "EACCES") throw new Error(`Permission denied: ${filename}`);
        if (error.code === "EISDIR") throw new Error(`Path is a directory, not a file: ${filename}`);
      }
      throw error;
    }
  }
  createNewNotebook(source: string): NotebookFile {
    return { cells: [{ cell_type: "code", id: this.generateCellId(), metadata: {}, source: this.normalizeSource(source), execution_count: null, outputs: [] }], metadata: { kernelspec: { display_name: "Python 3", language: "python", name: "python3" }, language_info: { name: "python", version: "3.8.0" } }, nbformat: 4, nbformat_minor: 2 };
  }
  async writeNotebookFile(filename: string, notebook: NotebookFile): Promise<void> {
    try { await writeFile(filename, JSON.stringify(notebook, undefined, 2), "utf8"); }
    catch (error) {
      if (error instanceof Error && "code" in error) { if (error.code === "EACCES") throw new Error(`Permission denied writing to: ${filename}`); if (error.code === "ENOSPC") throw new Error(`No space left on device: ${filename}`); }
      throw new Error(`Failed to write notebook file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  findCellIndexById(cells: NotebookCell[], id: string): number {
    for (let index = 0; index < cells.length; index++) if (cells[index]!.id === id) return index;
    const trimmed = id.trim();
    if (/^\d+$/.test(trimmed)) { const index = parseInt(trimmed, 10); if (index >= 0 && index < cells.length) return index; }
    const match = trimmed.match(/^cell-(\d+)$/i); if (match) { const index = parseInt(match[1]!, 10); if (index >= 0 && index < cells.length) return index; }
    for (let index = 0; index < cells.length; index++) { const actual = (cells[index]!.id || "").toLowerCase(), requested = trimmed.toLowerCase(); if (actual.includes(requested) || requested.includes(actual)) return index; }
    if (trimmed.startsWith("cell-") || /^\d+$/.test(trimmed)) for (let index = 0; index < cells.length; index++) if (!cells[index]!.id && (`cell-${index}` === trimmed || String(index) === trimmed)) return index;
    return -1;
  }
  generateCellId(): string { return Math.random().toString(36).substring(2, 11); }
  createNewCell(type: string, source: string): NotebookCell { const cell: NotebookCell = { cell_type: type, id: this.generateCellId(), metadata: {}, source: this.normalizeSource(source) }; if (type === "code") { cell.execution_count = null; cell.outputs = []; } return cell; }
  normalizeSource(source: string): string[] { if (!source) return []; const lines = source.split(/\r?\n/); return lines.length === 1 ? [source] : lines.slice(0, -1).map((line) => line + "\n").concat(lines.at(-1) || ""); }
  async execute(input: NotebookEditInput, context?: RunContext<HarnessSession>): Promise<{ title: string; content: string; renderer: { type: "diff" } }> {
    input.edit_mode ||= input.cell_id ? "replace" : "insert";
    const invalid = this.validateToolParams(input); if (invalid) throw new Error(`NotebookEdit error: Invalid parameters provided. Reason: ${invalid}`);
    try {
      let notebook: NotebookFile, before = "", isNew = false;
      try { notebook = await this.readNotebookFile(input.notebook_path); before = JSON.stringify(notebook, undefined, 2); }
      catch (error) { if (error instanceof Error && error.message.includes("does not exist") && !input.cell_id) { notebook = this.createNewNotebook(input.new_source); isNew = true; } else throw error; }
      let message = "";
      if (isNew) message = "Created new notebook file with initial content";
      else switch (input.edit_mode) {
        case "replace": {
          if (!input.cell_id) throw new Error("cell_id is required for replace mode");
          const index = this.findCellIndexById(notebook.cells, input.cell_id); if (index === -1) throw new Error(`Cell with ID "${input.cell_id}" not found in notebook`);
          const cell = notebook.cells[index]!, previous = cell.cell_type, type = input.cell_type || previous;
          cell.cell_type = type; cell.source = this.normalizeSource(input.new_source);
          if (type === "code" && previous !== "code") { cell.execution_count = undefined; cell.outputs = []; }
          else if (type !== "code" && previous === "code") { delete cell.execution_count; delete cell.outputs; }
          message = `Replaced cell ${input.cell_id} content (${previous} -> ${type})`; break;
        }
        case "insert": {
          if (!input.cell_type) throw new Error("cell_type is required for insert mode");
          const cell = this.createNewCell(input.cell_type, input.new_source); let position = 0;
          if (input.cell_id) { const index = this.findCellIndexById(notebook.cells, input.cell_id); if (index === -1) throw new Error(`Cell with ID "${input.cell_id}" not found in notebook`); position = index + 1; }
          notebook.cells.splice(position, 0, cell); message = `Inserted new ${input.cell_type} cell with ID ${cell.id} at position ${position}`; break;
        }
        case "delete": {
          if (!input.cell_id) throw new Error("cell_id is required for delete mode");
          const index = this.findCellIndexById(notebook.cells, input.cell_id); if (index === -1) throw new Error(`Cell with ID "${input.cell_id}" not found in notebook`);
          const cell = notebook.cells[index]!; notebook.cells.splice(index, 1); message = `Deleted ${cell.cell_type} cell ${input.cell_id} at position ${index}`; break;
        }
        default: throw new Error(`Unknown edit mode: ${input.edit_mode}`);
      }
      await this.writeNotebookFile(input.notebook_path, notebook); await this.readFileState.refreshFile(input.notebook_path);
      this.reportFileAction(context, input.notebook_path, before, JSON.stringify(notebook, undefined, 2), isNew);
      return { title: `${this.runtime.successMark?.("✓") ?? "✓"} ${message}`, content: `Successfully modified notebook: ${input.notebook_path}\n\n${message}\n\nTotal cells: ${notebook.cells.length}`, renderer: { type: "diff" } };
    } catch (error) { throw new Error(`NotebookEdit error: ${error instanceof Error ? error.message : String(error)}`); }
  }
  reportFileAction(context: RunContext<HarnessSession> | undefined, filename: string, before: string, after: string, isNew: boolean): void { this.runtime.reportFileAction?.(context, filename, before, after, isNew); }
  register(manager: ToolManager): void { manager.register(this.name, { parameters: this.parameters, parseInput: false, aliases: this.aliases,
    resolveNeedPermissionArgs: (context, input) => this.resolveNeedPermissionArgs(context, input as NotebookEditInput), execute: (input, context) => this.execute(input as NotebookEditInput, context) }); }
}

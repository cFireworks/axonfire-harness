import type { ModelInputData } from "@openai/agents";

export const LOOP_DETECTION_MARKER = "[LOOP_DETECTED]";
const BLACKLIST = new Set(["Read", "Grep", "Glob", "Write", "WebFetch", "WebSearch", "Edit", "Skill", "Bash"]);
const SKIPPED = new Set(["function_call_result", "reasoning"]);
type Call = { name: string; arguments: string };
type Detection = { detected: false } | { detected: true; toolName: string; reason: "generic_loop" | "read_file_loop"; consecutiveCount: number; message: string };

/** Exact tail scanning and thresholds from codebuddy.js offsets 7207144..7210301. */
export class ToolCallLoopDetectorImpl {
  check(modelData: ModelInputData): ModelInputData | null {
    try {
      const found = this.detectLoop(modelData.input);
      if (found.detected) return { ...modelData, input: [...modelData.input, { type: "message", role: "user", content: [{ type: "input_text", text: found.message }] }] };
    } catch { /* Original logs and lets the model request proceed. */ }
    return null;
  }
  detectLoop(input: unknown): Detection {
    if (!Array.isArray(input) || !input.length || this.hasExistingMarker(input)) return { detected: false };
    const tail = this.collectTailCalls(input);
    if (tail.length >= 4) {
      const generic = this.checkGenericLoop(tail);
      if (generic.detected) return generic;
      const read = this.checkReadFileLoop(tail);
      if (read.detected) return read;
    }
    return this.checkNonBlacklistLoop(input);
  }
  hasExistingMarker(input: any[]): boolean {
    return input.some((item) => item.type === "message" && item.role === "user" && Array.isArray(item.content)
      && item.content.some((part: any) => typeof part.text === "string" && part.text.includes(LOOP_DETECTION_MARKER)));
  }
  collectTailCalls(input: any[], blacklist = true): Call[] {
    const calls: Call[] = [];
    for (let index = input.length - 1; index >= 0; index--) {
      const item = input[index];
      if (item.type === "function_call") {
        if (BLACKLIST.has(item.name) === blacklist) calls.unshift({ name: item.name, arguments: item.arguments || "" });
      } else if (item.type && SKIPPED.has(item.type)) continue;
      else break;
    }
    return calls;
  }
  checkGenericLoop(calls: Call[], minimum = 4): Detection {
    const last = calls.at(-1);
    if (!last) return { detected: false };
    let count = 0;
    for (let index = calls.length - 1; index >= 0; index--) {
      if (`${calls[index]!.name}\0${calls[index]!.arguments}` !== `${last.name}\0${last.arguments}`) break;
      count++;
    }
    return this.detection(last.name, count, minimum, "generic_loop");
  }
  checkNonBlacklistLoop(input: any[]): Detection { return this.checkGenericLoop(this.collectTailCalls(input, false), 40); }
  checkReadFileLoop(calls: Call[]): Detection {
    const last = calls.at(-1);
    const path = last?.name === "Read" ? this.extractFilePath(last.arguments) : undefined;
    if (!path) return { detected: false };
    let count = 0;
    for (let index = calls.length - 1; index >= 0; index--) {
      if (calls[index]!.name !== "Read" || this.extractFilePath(calls[index]!.arguments) !== path) break;
      count++;
    }
    return this.detection("Read", count, 40, "read_file_loop");
  }
  buildStopMessage(name: string, count: number, reason: "generic_loop" | "read_file_loop"): string {
    return ["[", reason === "generic_loop"
      ? `Loop detected: the tool "${name}" has been called ${count} consecutive times with identical arguments.`
      : `Loop detected: the tool "${name}" has been reading the same file ${count} consecutive times.`, "",
    "STOP calling tools immediately. Do NOT make any more tool calls.",
    "Instead, tell the user what happened and suggest they switch models or modify their prompt to retry.", "]", "", LOOP_DETECTION_MARKER].join("\n");
  }
  extractFilePath(args: string): unknown {
    if (!args) return undefined;
    try { const parsed = JSON.parse(args); return parsed.file_path || parsed.filePath; }
    catch { return args.match(/"(?:file_path|filePath)"\s*:\s*"([^"]+)"/)?.[1]; }
  }
  private detection(name: string, count: number, minimum: number, reason: "generic_loop" | "read_file_loop"): Detection {
    return count >= minimum ? { detected: true, toolName: name, reason, consecutiveCount: count, message: this.buildStopMessage(name, count, reason) } : { detected: false };
  }
}

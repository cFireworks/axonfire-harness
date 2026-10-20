import { z } from "zod";
import type { HarnessSession } from "../sessions/session.js";
import type { AskService, QuestionAnswers } from "../interaction/ask-service.js";
import type { ToolManager, ToolCallDetails } from "./tool-manager.js";
import { ToolExecutionError, isToolExecutionError } from "./tool-execution-error.js";

const OPTION_EXAMPLE = '{"label": "...", "description": "..."}';
const EXPECTED_SHAPE = `Expected shape: {"questions": [{"question": "...", "header": "...", "options": [${OPTION_EXAMPLE}, ${OPTION_EXAMPLE}]}]}.`;
class DuplicateTracker {
  private readonly seen = new Set<string>();
  private readonly duplicates = new Set<string>();
  add(value: string): void { if (value.length === 0) return; if (this.seen.has(value)) this.duplicates.add(value); else this.seen.add(value); }
  hasDuplicates(): boolean { return this.duplicates.size > 0; }
  list(): string[] { return [...this.duplicates]; }
}
const describeType = (value: unknown): string => value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
const quoteList = (values: string[]): string => values.map((value) => `"${value}"`).join(", ");
function validationError(errors: string[]): string {
  const prefix = "AskUserQuestion error: Invalid parameters provided. Reason:";
  return errors.length === 1 ? `${prefix} ${errors[0]}` : `${prefix} Found ${errors.length} issues: ${errors.map((error, index) => `${index + 1}. ${error}`).join(" ")}`;
}
/** Product's friendly validator is intentionally distinct from its stricter advertised schema. */
export function validateAskUserQuestionParams(input: any): string | undefined {
  if (input === null || typeof input !== "object" || !("questions" in input) || input.questions === undefined) return validationError([`Missing required top-level field "questions" (array). ${EXPECTED_SHAPE}`]);
  if (!Array.isArray(input.questions)) return validationError([`"questions" expected array, but received ${describeType(input.questions)}. ${EXPECTED_SHAPE}`]);
  if (!input.questions.length) return validationError([`"questions" must not be empty; provide 1-4 question objects. ${EXPECTED_SHAPE}`]);
  const errors: string[] = [], questions = new DuplicateTracker();
  input.questions.forEach((question: any, index: number) => {
    const prefix = `questions[${index}]`;
    if (question === null || typeof question !== "object" || Array.isArray(question)) { errors.push(`${prefix} expected object, but received ${describeType(question)}. Each question must be an object with "question", "header" and "options".`); return; }
    if (!("question" in question) || question.question === undefined || question.question === null) errors.push(`${prefix} is missing required field "question" (string): the full question text shown to the user. Add it.`);
    else if (typeof question.question !== "string") errors.push(`${prefix}.question expected string, but received ${describeType(question.question)}. Make it the question text as a string.`);
    else questions.add(question.question.trim());
    if (!("header" in question) || question.header === undefined || question.header === null) errors.push(`${prefix} is missing required field "header" (string): a short chip label (e.g. "Auth method"). Add it.`);
    else if (typeof question.header !== "string") errors.push(`${prefix}.header expected string, but received ${describeType(question.header)}. Make it a short label string.`);
    if (!("options" in question) || question.options === undefined || question.options === null) errors.push(`${prefix} is missing required field "options" (array of ${OPTION_EXAMPLE}). Add it.`);
    else if (!Array.isArray(question.options)) errors.push(`${prefix}.options expected array, but received ${describeType(question.options)}. Make it an array of ${OPTION_EXAMPLE}.`);
    else {
      let nonempty = 0;
      const labels = new DuplicateTracker();
      question.options.forEach((option: any, offset: number) => {
        const key = `${prefix}.options[${offset}]`;
        if (option === null || typeof option !== "object" || Array.isArray(option)) { errors.push(`${key} expected object, but received ${describeType(option)}. Each option must be an object ${OPTION_EXAMPLE}, not a bare string.`); return; }
        if (!("label" in option) || option.label === undefined || option.label === null) errors.push(`${key} is missing required field "label" (string): the choice text. Add it.`);
        else if (typeof option.label !== "string") errors.push(`${key}.label expected string, but received ${describeType(option.label)}. Make it the choice text as a string.`);
        else if (option.label.trim().length > 0) { nonempty++; labels.add(option.label.trim()); }
        if (!("description" in option) || option.description === undefined || option.description === null) errors.push(`${key} is missing required field "description" (string): a short explanation of this choice. Add it (use "" if none).`);
        else if (typeof option.description !== "string") errors.push(`${key}.description expected string, but received ${describeType(option.description)}. Make it an explanation string.`);
      });
      if (nonempty < 1) errors.push(`${prefix}.options must contain at least 1 option with a non-empty "label" (found ${nonempty}). Add a concrete choice as ${OPTION_EXAMPLE}.`);
      if (labels.hasDuplicates()) errors.push(`${prefix}.options has duplicate label(s): ${quoteList(labels.list())}. Labels are the answer key, so each must be unique within a question. Rename the duplicate(s).`);
    }
    if ("multiSelect" in question && question.multiSelect !== undefined && typeof question.multiSelect !== "boolean") errors.push(`${prefix}.multiSelect expected boolean, but received ${describeType(question.multiSelect)}. Set true/false, or omit it (defaults to false).`);
  });
  if (questions.hasDuplicates()) errors.push(`questions has duplicate question text(s): ${quoteList(questions.list())}. The question text is the answer key, so each must be unique or answers overwrite each other. Reword the duplicate(s).`);
  return errors.length ? validationError(errors) : undefined;
}
function normalizeOption(value: any): { label: string; description: string } {
  return typeof value === "object" && value !== null && "label" in value ? { label: String(value.label || ""), description: String(value.description || "") } : { label: String(value || ""), description: "" };
}
export function normalizeAskUserQuestionInput(input: any): any {
  if (!input || !Array.isArray(input.questions)) return input;
  return { ...input, questions: input.questions.map((item: any, index: number) => {
    if (!item || typeof item !== "object") return item;
    const choices = item.options || item.answers;
    const options = Array.isArray(choices) ? choices.map(normalizeOption).filter((option) => option.label.trim().length > 0) : [];
    const question = typeof item.question === "string" ? item.question.trim() : "", header = typeof item.header === "string" ? item.header.trim() : "";
    const { answers: _legacy, ...rest } = item;
    return { ...rest, question: question || header || `Q${index + 1}`, header, options, multiSelect: item.multiSelect ?? false };
  }) };
}

export const questionOptionParameters = z.object({
  label: z.string().describe("The display text for this option that the user will see and select. Must NOT contain leading or trailing spaces. Should be concise (1-5 words) and clearly describe the choice."),
  description: z.string().describe("Explanation of what this option means or what will happen if chosen. Useful for providing context about trade-offs or implications. Must NOT contain leading or trailing spaces."),
});
export const questionParameters = z.object({
  question: z.string().describe('The complete question to ask the user. Should be clear, specific, and end with a question mark. Example: "Which library should we use for date formatting?" If multiSelect is true, phrase it accordingly, e.g. "Which features do you want to enable?"'),
  header: z.string().max(12).describe('Very short label displayed as a chip/tag (max 12 chars). Examples: "Auth method", "Library", "Approach".'),
  options: z.array(questionOptionParameters).min(2).max(4).describe('The available choices for this question. Must have 2-4 options. Each option MUST be an object with "label" and "description" fields (not a plain string). The "label" field is used as a key to look up the user\'s answer, so it MUST NOT have leading or trailing spaces (e.g. {"label":"Auth method"} is correct, {" label":"Auth method"} or {"label ":"Auth method"} with spaces around the key is NOT). Each option should be a distinct, mutually exclusive choice (unless multiSelect is enabled). Do NOT include an "Other" or "其他" option — the UI automatically provides a free-text input field below the predefined options so the user can type a custom answer if none of the choices fit. Including such an option will result in a duplicate UI element. IMPORTANT: Always format options as objects like [{"label": "Option 1", "description": "Description 1"}, {"label": "Option 2", "description": "Description 2"}], never as plain strings.'),
  multiSelect: z.boolean().default(false).describe("Set to true to allow the user to select multiple options instead of just one. Use when choices are not mutually exclusive."),
});
export const askUserQuestionParameters = z.object({
  questions: z.array(questionParameters).min(1).max(4).describe("Questions to ask the user (1-4 questions)"),
  answers: z.record(z.string(), z.string()).optional().describe("User answers collected by the permission component"),
  metadata: z.object({ source: z.string().optional().describe('Optional identifier for the source of this question (e.g., "remember" for /remember command). Used for analytics tracking.') }).optional().describe("Optional metadata for tracking and analytics purposes. Not displayed to user."),
}).refine((input) => new Set(input.questions.map((question) => question.question)).size === input.questions.length && input.questions.every((question) => new Set(question.options.map((option) => option.label)).size === question.options.length),
  { message: "Question texts must be unique, option labels must be unique within each question" });
export type AskUserQuestionInput = z.infer<typeof askUserQuestionParameters>;
export type AskQuestionRuntime = {
  getAcpCapabilities?: (connectionId: string) => { _meta?: Record<string, any> } | undefined;
  getSdkHookCapabilities?: () => { askUserQuestion?: boolean } | undefined;
};
export class AskUserQuestionTool {
  readonly parameters = askUserQuestionParameters;
  constructor(readonly service: AskService, private readonly runtime: AskQuestionRuntime = {}) {}
  isEnabled(session: HarnessSession): boolean {
    if (session.options.acp === true) {
      const id = session.meta.acpConnectionId as string | undefined;
      return Boolean(id && this.runtime.getAcpCapabilities?.(id)?._meta?.["codebuddy.ai"]?.question === true);
    }
    return session.options.inputFormat === "stream-json" ? this.runtime.getSdkHookCapabilities?.()?.askUserQuestion === true : session.options.print !== true;
  }
  async needsApproval(_context: unknown, input: unknown): Promise<boolean> { return !validateAskUserQuestionParams(input); }
  resolveAskErrorCode(error: unknown): string {
    if (isToolExecutionError(error)) return error.toolErrorCode;
    const message = error instanceof Error ? error.message : String(error);
    return /timed?\s?out|timeout/i.test(message) ? "90003" : /abort/i.test(message) ? "90004" : "19204";
  }
  async execute(raw: any, details?: ToolCallDetails): Promise<any> {
    const error = validateAskUserQuestionParams(raw);
    if (error) return { content: error, renderer: { type: "text" }, rawResponse: { is_error: true, tool_error_code: "19203" } };
    const input = normalizeAskUserQuestionInput(raw) as AskUserQuestionInput;
    try {
      let answers: QuestionAnswers | undefined;
      if (input.answers && Object.keys(input.answers).length > 0) answers = input.answers;
      else {
        const id = details?.toolCall?.callId || details?.toolCall?.id;
        if (!id) throw new ToolExecutionError("AskUserQuestion: missing toolCallId in tool call details", "19201");
        answers = await this.service.acquireAnswers(id);
      }
      if (!answers) throw new ToolExecutionError("No Answers", "19202");
      const skipped = input.questions.map((question) => `- "${question.question}"\n  (No answer provided)`).join("\n");
      if (answers._action === "skip_question") return { content: ["The user chose not to answer these questions.\nContinue the current task using the information already available.\n\nQuestions skipped:", skipped].join("\n"), renderer: { type: "text" } };
      if (answers._action === "skip_interview") return { content: ["The user has indicated they have provided enough answers for the plan interview.\nStop asking clarifying questions and proceed to finish the plan with the information you have.\n\nQuestions asked and answers provided:", skipped].join("\n"), renderer: { type: "text" } };
      if (answers._action === "chat_about_this") return { content: ["The user doesn't want to proceed with this tool use. The tool use was rejected (eg. if it was a file edit, the new_string was NOT written to the file). To tell you how to proceed, the user said:\nThe user wants to clarify these questions.\n    This means they may have additional information, context or questions for you.\n    Take their response into account and then reformulate the questions if appropriate.\n    Start by asking them what they would like to clarify.\n\n    Questions asked:", skipped].join("\n"), renderer: { type: "text" } };
      return { content: Object.entries(answers).filter(([key]) => !key.startsWith("_")).map(([key, value]) => ` · ${key} → ${value}`).join("\n"), renderer: { type: "text" } };
    } catch (error) { return { content: "User declined to answer questions", renderer: { type: "text" }, rawResponse: { is_error: true, tool_error_code: this.resolveAskErrorCode(error), error: error instanceof Error ? error.message : String(error) } }; }
  }
  register(manager: ToolManager): void {
    manager.register("AskUserQuestion", { parameters: this.parameters, parseInput: false, needsApproval: (context, input) => this.needsApproval(context, input),
      isEnabled: (session) => this.isEnabled(session), execute: (input, _context, details) => this.execute(input, details) });
  }
}

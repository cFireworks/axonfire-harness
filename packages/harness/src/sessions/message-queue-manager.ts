import { randomUUID } from "node:crypto";
import type { AgentInputItem } from "@openai/agents-core";
import type { HarnessSession } from "./session.js";

const isUser = (item: any) => item.type === "message" && item.role === "user";
export const isQueueHoldItem = (item: any): boolean => Boolean(item.providerData?.queueHold);
export const isSkipRunItem = (item: any): boolean => Boolean(item.providerData?.skipRun);
export function getUserMessageText(item: any): string { return typeof item.content === "string" ? item.content : item.content.map((part: any) => part.type === "input_text" && typeof part.text === "string" ? part.text : "").join("\n"); }
export function isEditableQueuedMessage(item: any): boolean { if (!isUser(item) || item.providerData?.isMeta === true || isSkipRunItem(item) || typeof item.providerData?.teammateMessage?.from === "string" || /<teammate-message\b/i.test(getUserMessageText(item))) return false; const text = getUserMessageText(item); return !(text.includes("<agent-notification>") || /<channel\b/i.test(text)); }
export function extractEditableText(item: any): string { return isUser(item) ? getUserMessageText(item) : ""; }
export type EditableImage = { placeholderId: number; dataUrl: string };
export function extractEditableImages(item: any): EditableImage[] {
  if (!isUser(item) || !Array.isArray(item.content)) return [];
  const placeholders: number[] = [], images: string[] = [];
  for (const part of item.content) if (part?.type === "input_text" && typeof part.text === "string") { const pattern = /\[Image #(\d+)\]/g; let match: RegExpExecArray | null; while ((match = pattern.exec(part.text)) !== null) placeholders.push(parseInt(match[1]!, 10)); }
  for (const part of item.content) if (part?.type === "input_image") { const image = typeof part.image === "string" ? part.image : part.image && typeof part.image.url === "string" ? part.image.url : undefined; if (typeof image === "string" && image.startsWith("data:")) images.push(image); }
  return images.map((dataUrl, index) => ({ placeholderId: index < placeholders.length ? placeholders[index]! : -(index + 1), dataUrl }));
}
export function mergeUserMessageGroup(group: AgentInputItem[]): AgentInputItem {
  if (group.length === 1) return group[0]!;
  const content: any[] = []; for (const item of group as any[]) if (typeof item.content === "string") content.push({ type: "input_text", text: item.content }); else if (Array.isArray(item.content)) content.push(...item.content);
  return { ...group[0], content } as AgentInputItem;
}
export function mergeConsecutiveUserMessages(input: AgentInputItem[]): AgentInputItem[] {
  if (!input.length) return input;
  const output: AgentInputItem[] = []; let group: AgentInputItem[] = [];
  const flush = () => { if (group.length) { output.push(mergeUserMessageGroup(group)); group = []; } };
  for (const item of input as any[]) if (isUser(item)) { if (item.providerData?.teammateMessage) { flush(); output.push(item); } else group.push(item); } else { flush(); output.push(item); }
  flush(); return output;
}
/** Source 11093993..11096012. UI usage accounting remains an optional host adapter. */
export class MessageQueueManager {
  constructor(private readonly runtime: { incrementPromptQueue?: () => Promise<unknown>; error?: (message: string, error: unknown) => void } = {}) {}
  enqueueMessage(session: HarnessSession, item: AgentInputItem): string { const id = randomUUID(); session.queue.push(item); session.queueSubject.next([...session.queue]); this.runtime.incrementPromptQueue?.().catch((error) => this.runtime.error?.("Failed to increment prompt queue usage:", error)); return id; }
  dequeueMessage(session: HarnessSession): AgentInputItem | undefined { const item = session.queue.shift(); session.queueSubject.next([...session.queue]); return item; }
  clearQueue(session: HarnessSession): void { session.queue.length = 0; session.queueSubject.next([]); }
  removeMessage(session: HarnessSession, index: number): void { if (index >= 0 && index < session.queue.length) { session.queue.splice(index, 1); session.queueSubject.next([...session.queue]); } }
  getQueue(session: HarnessSession): AgentInputItem[] { return session.queue; }
  hasEditableMessage(session: HarnessSession): boolean { return session.queue.some(isEditableQueuedMessage); }
  popAllEditable(session: HarnessSession, additionalText: string): { text: string; images: EditableImage[] } | undefined {
    if (!session.queue.length) return;
    const selected = session.queue.filter(isEditableQueuedMessage), remaining = session.queue.filter((item) => !isEditableQueuedMessage(item)); if (!selected.length) return;
    const text = [...selected.map(extractEditableText), additionalText].filter(Boolean).join("\n"), images = selected.flatMap(extractEditableImages);
    session.queue.length = 0; session.queue.push(...remaining); session.queueSubject.next([...session.queue]); return { text, images };
  }
  popLastEditableQueueHold(session: HarnessSession, additionalText: string): { text: string; images: EditableImage[] } | undefined {
    if (!session.queue.length) return; let index = -1;
    for (let offset = session.queue.length - 1; offset >= 0; offset--) if (isQueueHoldItem(session.queue[offset]) && isEditableQueuedMessage(session.queue[offset])) { index = offset; break; }
    if (index === -1) return; const [item] = session.queue.splice(index, 1); session.queueSubject.next([...session.queue]); return { text: [extractEditableText(item), additionalText].filter(Boolean).join("\n"), images: extractEditableImages(item) };
  }
  popAllEditableQueueHold(session: HarnessSession, additionalText: string): { text: string; images: EditableImage[] } | undefined {
    if (!session.queue.length) return; const text: string[] = [], remaining: AgentInputItem[] = [], images: EditableImage[] = [];
    for (const item of session.queue) if (isQueueHoldItem(item) && isEditableQueuedMessage(item)) { text.push(extractEditableText(item)); images.push(...extractEditableImages(item)); } else remaining.push(item);
    if (!text.length) return; session.queue.length = 0; session.queue.push(...remaining); session.queueSubject.next([...session.queue]); return { text: [...text, additionalText].filter(Boolean).join("\n"), images };
  }
}
export class QueueDispatchUtils {
  static readonly ENV_KEY = "CODEBUDDY_CODE_MESSAGE_QUEUE_DEFERRED_DISPATCH";
  static readonly TEAM_IMMEDIATE_DISPATCH_ENV_KEY = "CBC_TEAM_IMMEDIATE_DISPATCH";
  static isDeferredDispatchEnabledSync(features: Record<string, unknown> = {}): boolean { const value = process.env[this.ENV_KEY]; return value !== undefined ? ["1", "true", "yes", "on"].includes(value.toLowerCase().trim()) : features.MessageQueueDeferredDispatch === true; }
  static async isDeferredDispatchEnabled(features: () => Promise<Record<string, unknown>>): Promise<boolean> { const value = process.env[this.ENV_KEY]; if (value !== undefined) return ["1", "true", "yes", "on"].includes(value.toLowerCase().trim()); return (await features()).MessageQueueDeferredDispatch === true; }
  static isTeamImmediateDispatchEnabled(): boolean { const value = process.env[this.TEAM_IMMEDIATE_DISPATCH_ENV_KEY]; if (value === undefined) return true; return !["0", "false", "off", "no"].includes(value.trim().toLowerCase()); }
}

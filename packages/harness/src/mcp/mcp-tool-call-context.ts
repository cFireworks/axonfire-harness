import { AsyncLocalStorage } from "node:async_hooks";
const context = new AsyncLocalStorage<{ callId: string; toolName: string } | undefined>();
/** Original module 80539: context is entered, not scoped with run(). */
export const McpToolCallContext = {
  enter(callId: string, toolName: string): void { if (callId && toolName) context.enterWith({ callId, toolName }); },
  clear(): void { context.enterWith(undefined); },
  getCallIdForTool(toolName: string): string | undefined { const store = context.getStore(); if (store?.callId && store.toolName) return store.toolName === toolName ? store.callId : undefined; },
  getStore: () => context.getStore(),
};

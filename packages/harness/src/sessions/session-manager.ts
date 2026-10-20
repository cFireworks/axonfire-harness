import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { BehaviorSubject, type Subscription } from "rxjs";
import type { AgentInputItem } from "@openai/agents-core";
import { HarnessSession } from "./session.js";
import type { SessionStore, SessionLoadOptions } from "./session-store.js";
import type { SessionRunStateMachine } from "./run-state-machine.js";
import { isCustomHistoryItem, type HistoryItem } from "./history-utils.js";
import type { AgentInputItemPipeline } from "./input-item-pipeline.js";
import { NativeHistoryInputUtils } from "./input-processor-utils.js";
import { SessionResultLifecycle } from "./session-result-lifecycle.js";
import { createSessionResultRuntime, createSessionResultObservers, type SessionLifecycleOptions } from "./session-result-runtime.js";

export type SessionThinkingOverride = {
  thinkingEnabled?: boolean;
  reasoningEffort?: string;
};

export class SessionManager {
  readonly sessionSubject = new BehaviorSubject<HarnessSession | undefined>(
    undefined,
  );
  private readonly sessions = new Map<string, HarnessSession>();
  private readonly currentStorage = new AsyncLocalStorage<HarnessSession>();
  private readonly skipHistoryContext = new AsyncLocalStorage<boolean>();
  private readonly addHistoryLocks = new Map<string, Promise<void>>();
  private readonly resultSubscriptions = new Map<string, Subscription>();
  private readonly resultHandling = new WeakMap<object, Promise<void>>();
  private readonly thinkingOverrides = new Map<
    string,
    SessionThinkingOverride
  >();
  readonly resultLifecycle?: SessionResultLifecycle;
  private readonly resultGates=new WeakMap<object,NonNullable<HarnessSession['interceptorGate']>>();
  private readonly activeResultConsumers=new WeakSet<object>();
  private readonly nativeResultErrors=new WeakMap<object,unknown>();

  constructor(
    private readonly store?: SessionStore,
    private readonly stateMachine?: SessionRunStateMachine,
    private readonly options: {
      inputItemPipeline?: AgentInputItemPipeline;
      resultLifecycle?: SessionLifecycleOptions;
      processInputItem?: (item: AgentInputItem, session: HarnessSession) => void | Promise<void>;
      onSessionStart?: (session: HarnessSession, reason: string) => void | Promise<void>;
      onUserPromptSubmit?: (session: HarnessSession, items: AgentInputItem[]) => void | Promise<void>;
      onResultError?: (error: unknown, session: HarnessSession, result: object) => void;
      /** Standalone error owner: native InterruptionService arbitrates retries. */
      manageResultErrorState?: boolean;
    } = {},
  ) {
    if(options.resultLifecycle){
      const lifecycleOptions=options.resultLifecycle;
      const runtime=createSessionResultRuntime(lifecycleOptions,(session,callback)=>session.resultSubject.subscribe((value:any)=>{
        const previous=session.interceptorGate;
        if(value&&typeof value==='object'&&!value.__cancelNudge)this.activeResultConsumers.add(value);
        const task=callback(value);
        if(value&&typeof value==='object'&&!value.__cancelNudge){
          if(session.interceptorGate!==previous&&session.interceptorGate)this.resultGates.set(value,session.interceptorGate);
          const handling=task.catch(error=>{this.nativeResultErrors.set(value,error);this.options.onResultError?.(error,session,value)}).then(()=>this.flushHistory(session)).finally(()=>this.activeResultConsumers.delete(value));
          this.resultHandling.set(value,handling);
        }else void task.catch(()=>{});
      }),(session,result,error)=>{if(result&&typeof result==='object'){this.nativeResultErrors.set(result,error);this.options.onResultError?.(error,session,result)}});
      const logger=lifecycleOptions.logger??{info(){},debug(){},warn(){},error(){}};
      this.resultLifecycle=new SessionResultLifecycle(runtime,{
        ...createSessionResultObservers(lifecycleOptions),logger,
        stateMachine:stateMachine??{isIdle:()=>true,transition(){}},
        interruptionService:{waitFor:(session:HarnessSession)=>lifecycleOptions.getInterruptionService?.()?.waitFor(session)??Promise.resolve()},
        sessionHookManager:{executeSessionStartHooks:(session:HarnessSession,reason:string)=>lifecycleOptions.onSessionStart?.(session,reason)??this.options.onSessionStart?.(session,reason),executeNotificationHooks:(session:HarnessSession,message:string,kind:string)=>lifecycleOptions.onNotification?.(session,message,kind)},
        interceptors:lifecycleOptions.interceptors??[],
        addHistory:(session:HarnessSession,items:AgentInputItem[])=>this.addHistory(session,items),flushHistory:(session:HarnessSession)=>this.flushHistory(session),
        stampModelHistoryItemTimestamp:(item:any)=>this.stampModelHistoryItemTimestamp(item),stampModelStreamEventTimestamp:(item:any)=>this.stampModelStreamEventTimestamp(item),
        formatCreditForLog:(value:any)=>{if(value===null||typeof value!=='object'||!('credit'in value))return'undefined';if(value.credit===undefined)return'undefined';try{return JSON.stringify(value.credit)??String(value.credit)}catch{return String(value.credit)}},
      });
    }
  }

  async create(seed: Partial<HarnessSession> = {}, handleResults = false): Promise<HarnessSession> {
    const session = new HarnessSession(seed.id ?? randomUUID(), seed);
    this.sessions.set(session.id, session);
    this.sessionSubject.next(session);
    if (handleResults) this.initRunResultHandler(session);
    return session;
  }

  async get(id: string, options?: SessionLoadOptions): Promise<HarnessSession | undefined> {
    const existing = (
      this.sessions.get(id) ??
      [...this.sessions.values()].find((item) => item.storeId === id)
    );
    if (existing) return existing;
    const loaded = await this.store?.get(id, options);
    if (loaded) this.sessions.set(loaded.id, loaded);
    return loaded;
  }

  getCurrent(): HarnessSession | undefined {
    return this.currentStorage.getStore();
  }

  async addHistory(
    session: HarnessSession,
    input: AgentInputItem | AgentInputItem[],
  ): Promise<void> {
    if (this.skipHistoryContext.getStore()) return;
    const items = Array.isArray(input) ? input : [input];
    const previous = this.addHistoryLocks.get(session.id) ?? Promise.resolve();
    const operation = previous.catch(() => undefined).then(async () => {
      for (const item of items) {
        const raw = item as HistoryItem;
        this.ensureHistoryItemTimestamp(raw);
        if (this.options.inputItemPipeline) {
          await this.options.inputItemPipeline.process(item, session);
          if (raw.providerData?.isCompacted === true || raw.providerData?.isSummary === true) session.hasCompactedHistory = true;
        } else if (!isCustomHistoryItem(raw)) {
          raw.providerData ??= {};
          if (!raw.id || raw.id === "FAKE_ID") raw.id = randomUUID();
          raw.sessionId ||= session.id;
          const agentName = (session.resultSubject.value as any)?.lastAgent?.name ?? session.agentName;
          if (agentName) raw.providerData.agent ||= agentName;
          const result = session.resultSubject.value as any;
          const response = result?.rawResponses?.at(-1);
          if (response && (raw.providerData._isLastResponseItem === true || response.output?.at(-1) === item)) {
            raw.providerData.usage = response.usage;
            delete raw.providerData._isLastResponseItem;
            session.usage.add(response.usage);
          }
          if (agentName === "compact" && raw.type === "message" && raw.role === "assistant") {
            const text = typeof raw.content === "string" ? raw.content : Array.isArray(raw.content)
              ? raw.content.map((part: any) => part?.text ?? "").join("\n") : "";
            if (/<(?:summary|conversation_history_summary)>[\s\S]+?<\/(?:summary|conversation_history_summary)>/i.test(text)) {
              Object.assign(raw.providerData, { isCompactInternal: true, isCompacted: true, isSummary: true });
              raw.providerData.compactType ??= session.meta.compactType ?? "user-command";
            }
          }
          const parentId = raw.parentId ?? session.lastMessageId;
          if (raw.providerData.isCompacted === true || raw.providerData.isSummary === true) {
            delete raw.parentId;
            if (parentId) raw.logicalParentId = parentId;
            session.hasCompactedHistory = true;
          } else if (parentId && parentId !== raw.id) raw.parentId = parentId;
          session.lastMessageId = raw.id;
        }
        await this.options.processInputItem?.(item, session);
        session.history.push(item);
        session.updatedAt = Date.now();
        session.inputSubject.next(item);
        session.combineSubject.next({ type: "input", data: item });
      }
      // Captured addHistory dispatch: after input publication, before transcript append;
      // only real, non-compact user input in a root session triggers this event.
      if(items.some(item=>NativeHistoryInputUtils.isRealUserMessageItem(item)&&(item as any).providerData?.agent!=="compact")&&!session.meta?.parentSessionId)
        await this.options.onUserPromptSubmit?.(session,items);
      await this.store?.save(session);
      await this.store?.appendHistory(session.storeId ?? session.id, items,
        typeof session.meta.parentSessionId === "string" ? session.meta.parentSessionId : undefined, session);
      this.resultLifecycle?.resetIdleTimer(session);
    });
    this.addHistoryLocks.set(session.id, operation);
    try { await operation; }
    finally { if (this.addHistoryLocks.get(session.id) === operation) this.addHistoryLocks.delete(session.id); }
  }

  setOverrideThinking(
    sessionId: string,
    override: SessionThinkingOverride | null,
  ): void {
    if (override === null) this.thinkingOverrides.delete(sessionId);
    else this.thinkingOverrides.set(sessionId, override.thinkingEnabled === false ? { thinkingEnabled: false } : { ...override });
  }

  getOverrideThinking(
    sessionId: string,
  ): SessionThinkingOverride | undefined {
    const value = this.thinkingOverrides.get(sessionId);
    return value ? { ...value } : undefined;
  }

  initRunResultHandler(session: HarnessSession): void {
    if(this.resultLifecycle){this.resultLifecycle.initRunResultHandler(session);return}
    if (this.resultSubscriptions.has(session.id)) return;
    this.resultSubscriptions.set(session.id, session.resultSubject.subscribe((value) => {
      if (!value || typeof value !== "object" || (value as any).__cancelNudge || this.skipHistoryContext.getStore()) return;
      if (this.resultHandling.has(value)) return;
      const handling = this.handleRunResult(session, value).catch((error) => {
        if (this.options.manageResultErrorState !== false) this.stateMachine?.transition(session, "run_failed");
        this.options.onResultError?.(error, session, value);
      });
      this.resultHandling.set(value, handling);
    }));
  }

  /** Native startup initializes once; explicit initRunResultHandler still re-subscribes. */
  ensureRunResultHandler(session:HarnessSession):void{
    if(this.resultLifecycle){if(!this.resultLifecycle.resultSubscriptions.has(session.id))this.initRunResultHandler(session)}else this.initRunResultHandler(session);
  }
  getResultGate(result:object):HarnessSession['interceptorGate']{return this.resultGates.get(result)}
  /** Standalone execution/history publication barrier, outside original methods. */
  async waitForToolCallHistory(session:HarnessSession,callId:string):Promise<void>{
    const result=session.resultSubject.value;
    if(!result||typeof result!=='object'||!this.activeResultConsumers.has(result))return;
    const recorded=()=>session.history.some((item:any)=>item.type==='function_call'&&(item.callId===callId||item.call_id===callId));
    if(recorded()){await this.flushHistory(session);return}
    const signal=session.abortSignal;signal.throwIfAborted();
    let stop=()=>{};
    const arrived=new Promise<void>((resolve,reject)=>{const abort=()=>reject(signal.reason??new Error('Aborted')),subscription=session.inputSubject.subscribe(()=>{if(recorded())resolve()});signal.addEventListener('abort',abort,{once:true});stop=()=>{subscription.unsubscribe();signal.removeEventListener('abort',abort)};if(recorded())resolve()});
    try{await Promise.race([arrived,this.resultHandling.get(result)??new Promise(()=>{})]);await this.flushHistory(session);const error=this.nativeResultErrors.get(result);if(error)throw error;signal.throwIfAborted()}finally{stop()}
  }
  async waitForNextResult(session:HarnessSession,previous:object,signal:AbortSignal):Promise<void>{
    signal.throwIfAborted();if(session.resultSubject.value!==previous)return;
    await new Promise<void>((resolve,reject)=>{let subscription:Subscription|undefined;const abort=()=>{subscription?.unsubscribe();reject(signal.reason??new Error('Aborted'))};signal.addEventListener('abort',abort,{once:true});subscription=session.resultSubject.subscribe(value=>{if(value&&value!==previous){signal.removeEventListener('abort',abort);subscription?.unsubscribe();resolve()}});if(session.resultSubject.value!==previous){subscription.unsubscribe();signal.removeEventListener('abort',abort);resolve()}});
  }

  async flushHistory(session: HarnessSession): Promise<void> { await this.addHistoryLocks.get(session.id); }

  // Native SessionManager timestamp helpers, UTF-16 10956732..10957300.
  readTimestamp(item: any): number | undefined {
    const value = item?.timestamp;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    return undefined;
  }
  setTimestamp(item: any, value: number): number {
    if (item && typeof item === "object") item.timestamp = value;
    return value;
  }
  ensureHistoryItemTimestamp(item: any, fallback = Date.now()): number {
    const value = this.readTimestamp(item);
    return value !== undefined ? value : (item.timestamp = fallback, fallback);
  }
  stampModelStreamEventTimestamp(item: any): number { return this.setTimestamp(item, this.readTimestamp(item) ?? Date.now()); }
  stampModelHistoryItemTimestamp(item: any): number { return this.ensureHistoryItemTimestamp(item); }

  async waitForResultHandled(result: object): Promise<void> { await this.resultHandling.get(result); }

  /** Host lifecycle adapter; does not remove persisted transcripts. */
  release(session: HarnessSession): void {
    this.resultLifecycle?.release(session.id);
    this.resultSubscriptions.get(session.id)?.unsubscribe();
    this.resultSubscriptions.delete(session.id);
    this.sessions.delete(session.id);
    this.thinkingOverrides.delete(session.id);
    if (this.sessionSubject.value === session) this.sessionSubject.next(undefined);
  }

  runWithoutHistory<T>(operation: () => T): T { return this.skipHistoryContext.run(true, operation); }

  async emitSessionStart(session: HarnessSession, reason: string): Promise<void> { if(this.resultLifecycle)await this.resultLifecycle.emitSessionStart(session,reason);else await this.options.onSessionStart?.(session, reason); }

  async save(session: HarnessSession, includeHistory = false): Promise<void> {
    await this.flushHistory(session);
    if (includeHistory) await this.store?.saveHistory(session);
    else await this.store?.save(session);
  }

  getSessionFilePath(session: HarnessSession): string | undefined {
    return this.store?.getSessionFilePath(session.storeId ?? session.id,
      typeof session.meta.parentSessionId === "string" ? session.meta.parentSessionId : undefined);
  }

  async getAll(): Promise<HarnessSession[]> { return this.store?.getAll() ?? [...this.sessions.values()]; }
  getCachedSessions(): HarnessSession[] { return [...this.sessions.values()]; }

  private async handleRunResult(session: HarnessSession, result: any): Promise<void> {
    session.state = result.state;
    const signal = session.resultAbortSignalMap.get(result) ?? session.abortSignal;
    if (typeof result[Symbol.asyncIterator] === "function") {
      for await (const event of result) {
        if (signal.aborted) break;
        if (event.type === "run_item_stream_event" && event.item?.type !== "tool_approval_item") {
          const raw = event.item?.rawItem;
          if (raw) {
            const latestResponse = result.rawResponses?.at(-1);
            const copied = { ...raw };
            // Native item processors mutate the same tool-result metadata that
            // the SDK's next model lookup sees. Keep that metadata shared so
            // normalization's toolResult guard prevents double-unwrapping.
            if (raw.type === "function_call_result") copied.providerData = raw.providerData ??= {};
            if (latestResponse?.output?.at(-1) === raw) {
              copied.providerData = { ...raw.providerData, _isLastResponseItem: true };
            }
            await this.addHistory(session, [copied]);
          }
        } else if (event.type === "agent_updated_stream_event") {
          session.agentName = event.agent.name;
        } else if (event.type === "raw_model_stream_event") {
          if (event.data.type === "response_done") this.stateMachine?.transition(session, "model_done");
          else if (event.data.type === "output_text_delta") this.stateMachine?.transition(session, "model_streaming");
          session.modelSubject.next(event.data);
          session.combineSubject.next({ type: "model", data: event.data });
        }
      }
    } else if (Array.isArray(result.output)) await this.addHistory(session, result.output);
    await result.completed;
    await this.flushHistory(session);
    if (session.resultSubject.value !== result) return;
    if (!result.interruptions?.length && !session.isCompressing) this.stateMachine?.transition(session, "run_completed");
  }

  async run<T>(
    session: HarnessSession,
    operation: () => Promise<T>,
  ): Promise<T> {
    this.sessionSubject.next(session);
    return this.currentStorage.run(session, operation);
  }
}

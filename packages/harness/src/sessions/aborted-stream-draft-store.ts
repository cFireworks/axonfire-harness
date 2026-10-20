import { randomUUID } from "node:crypto";
// Native UTF-16 10949890..10954861.
export class AbortedStreamDraftStore {
  [key: string]: any;
  constructor(readonly generateUUUID: () => string = randomUUID) {
    ((this.toolCallDrafts = new Map()),
      (this.toolCallIndexToId = new Map()),
      (this.committedRefs = new WeakSet()),
      (this.committedKeys = new Set()));
  }
  ingestModelStreamEvent(eA: any): any {
    "output_text_delta" === eA.type
      ? this.appendAssistantText(eA.delta)
      : "model" === eA.type && this.ingestRawModelEvent(eA.event);
  }
  markCommitted(eA: any): any {
    let el: any = eA;
    for (let eA of (el && "object" == typeof el && this.committedRefs.add(el),
    this.getItemKeys(el)))
      this.committedKeys.add(eA);
    if ("message" === el.type && "assistant" === el.role) {
      this.assistantMessageDraft = void 0;
      return;
    }
    if ("reasoning" === el.type) {
      this.reasoningDraft = void 0;
      return;
    }
    "function_call" === el.type &&
      el.callId &&
      (this.toolCallDrafts.delete(el.callId),
      this.deleteToolCallIndex(el.callId));
  }
  flushAbortedItems(eA: any): any {
    let el: any = [];
    for (let ec of (this.pushIfFlushable(el, this.reasoningDraft, eA),
    this.pushIfFlushable(el, this.assistantMessageDraft, eA),
    this.toolCallDrafts.values()))
      this.pushIfFlushable(el, ec, eA);
    return (this.resetDrafts(), el);
  }
  ingestRawModelEvent(eA: any): any {
    eA &&
      "object" == typeof eA &&
      (this.ingestResponsesEvent(eA), this.ingestChatCompletionsEvent(eA));
  }
  ingestResponsesEvent(eA: any): any {
    if (
      "response.output_item.added" === eA.type &&
      eA.item?.type === "function_call"
    ) {
      let el: any = eA.item.call_id || eA.item.id;
      "string" == typeof el &&
        el.length > 0 &&
        this.ensureToolCallDraft(el, eA.item.name || "");
      return;
    }
    if ("response.function_call_arguments.delta" === eA.type) {
      let el: any = eA.call_id;
      if ("string" != typeof el || 0 === el.length) return;
      let ec: any = this.ensureToolCallDraft(el, eA.name || "");
      "string" == typeof eA.delta &&
        (ec.arguments = `${ec.arguments || ""}${eA.delta}`);
    }
  }
  ingestChatCompletionsEvent(eA: any): any {
    let el: any = eA.choices;
    if (Array.isArray(el))
      for (let eA of el) {
        let el: any = eA?.delta;
        if (!el || "object" != typeof el) continue;
        let ec: any = el.reasoning_content ?? el.reasoning;
        ("string" == typeof ec && ec.length > 0 && this.appendReasoningText(ec),
          Array.isArray(el.tool_calls) &&
            this.ingestChatToolCalls(el.tool_calls));
      }
  }
  ingestChatToolCalls(eA: any): any {
    for (let el of eA) {
      if (!el || "object" != typeof el) continue;
      let eA: any = "number" == typeof el.index ? el.index : void 0,
        ec: any = this.resolveToolCallId(el.id, eA);
      if (!ec) continue;
      void 0 !== eA && this.toolCallIndexToId.set(eA, ec);
      let eu: any =
          "string" == typeof el.function?.name ? el.function.name : "",
        ed: any =
          "string" == typeof el.function?.arguments
            ? el.function.arguments
            : "",
        ep: any = this.ensureToolCallDraft(ec, eu);
      (eu && (ep.name = eu),
        ed && (ep.arguments = `${ep.arguments || ""}${ed}`));
    }
  }
  resolveToolCallId(eA: any, el: any): any {
    return "string" == typeof eA && eA.length > 0
      ? eA
      : void 0 !== el
        ? this.toolCallIndexToId.get(el)
        : void 0;
  }
  appendAssistantText(eA: any): any {
    if (!eA) return;
    let el: any = this.ensureAssistantMessageDraft(),
      ec: any = el.content?.[0];
    ec && (ec.text = `${ec.text || ""}${eA}`);
  }
  appendReasoningText(eA: any): any {
    if (!eA) return;
    let el: any = this.ensureReasoningDraft(),
      ec: any = el.content?.[0];
    ec && (ec.text = `${ec.text || ""}${eA}`);
    let eu: any = el.rawContent?.[0];
    eu && (eu.text = `${eu.text || ""}${eA}`);
  }
  ensureAssistantMessageDraft(): any {
    return (
      this.assistantMessageDraft ||
        (this.assistantMessageDraft = {
          id: this.generateUUUID(),
          type: "message",
          role: "assistant",
          status: "in_progress",
          content: [{ type: "output_text", text: "" }],
        }),
      this.assistantMessageDraft
    );
  }
  ensureReasoningDraft(): any {
    return (
      this.reasoningDraft ||
        (this.reasoningDraft = {
          id: this.generateUUUID(),
          type: "reasoning",
          content: [{ type: "input_text", text: "" }],
          rawContent: [{ type: "reasoning_text", text: "" }],
          status: "in_progress",
        }),
      this.reasoningDraft
    );
  }
  ensureToolCallDraft(eA: any, el: any): any {
    let ec: any = this.toolCallDrafts.get(eA);
    return (
      ec
        ? el && (ec.name = el)
        : ((ec = {
            id: this.generateUUUID(),
            type: "function_call",
            callId: eA,
            name: el,
            arguments: "",
            status: "in_progress",
          }),
          this.toolCallDrafts.set(eA, ec)),
      ec
    );
  }
  pushIfFlushable(eA: any, el: any, ec: any): any {
    !(!el || this.isCommitted(el)) &&
      this.hasMeaningfulContent(el) &&
      eA.push(this.toAbortedItem(el, ec));
  }
  toAbortedItem(eA: any, el: any): any {
    let ec: any = {
      ...eA.providerData,
      messageId: el.messageId,
      model: el.model,
      ...(el.requestModelId ? { requestModelId: el.requestModelId } : {}),
      ...(el.requestModelName ? { requestModelName: el.requestModelName } : {}),
      ...(el.traceId ? { traceId: el.traceId } : {}),
      ...(el.conversationRequestId
        ? { conversationRequestId: el.conversationRequestId }
        : {}),
      isPartialAborted: !0,
    };
    return {
      ...eA,
      timestamp: el.timestamp,
      content: eA.content?.map((eA: any) => ({ ...eA })),
      rawContent: eA.rawContent?.map((eA: any) => ({ ...eA })),
      status: "incomplete",
      providerData: ec,
    };
  }
  hasMeaningfulContent(eA: any): any {
    return "message" === eA.type && "assistant" === eA.role
      ? !!eA.content?.some(
          (eA: any) => "string" == typeof eA.text && eA.text.length > 0,
        )
      : "reasoning" === eA.type
        ? !!(
            eA.rawContent?.some((eA: any) => eA.text.length > 0) ||
            eA.content?.some(
              (eA: any) => "string" == typeof eA.text && eA.text.length > 0,
            )
          )
        : "function_call" === eA.type && !!(eA.callId && eA.name);
  }
  isCommitted(eA: any): any {
    return (
      !!(eA && "object" == typeof eA && this.committedRefs.has(eA)) ||
      this.getItemKeys(eA).some((eA: any) => this.committedKeys.has(eA))
    );
  }
  getItemKeys(eA: any): any {
    let el: any = [];
    return (
      eA.id && el.push(`id:${eA.id}`, `${eA.type || "unknown"}:${eA.id}`),
      eA.callId &&
        el.push(`callId:${eA.callId}`, `${eA.type || "unknown"}:${eA.callId}`),
      el
    );
  }
  deleteToolCallIndex(eA: any): any {
    for (let [el, ec] of this.toolCallIndexToId)
      ec === eA && this.toolCallIndexToId.delete(el);
  }
  resetDrafts(): any {
    ((this.assistantMessageDraft = void 0),
      (this.reasoningDraft = void 0),
      this.toolCallDrafts.clear(),
      this.toolCallIndexToId.clear());
  }
}

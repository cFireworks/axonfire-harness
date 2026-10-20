export const ACP_INPUT_RENDERER_METHODS = [
  ["annotatePromptDerivedContent", 8317699, 8318542],
  ["injectTrackingMeta", 8318542, 8319172],
  ["tryExecuteLocalCommand", 8319172, 8320693],
] as const;
export const ACP_PROMPT_TIMESTAMP_FUNCTION = [
  "applyAcpPromptTimestamp",
  8305260,
  8305387,
] as const;

export function createNativeAcpInputRenderer(codec: any, runtime: any = {}) {
  const ne: any = codec,
    nh: any = runtime.timestamps,
    np: any = runtime;
  function applyAcpPromptTimestamp(eA: any, el: any): any {
    for (let ec of eA) {
      let eA: any = ec;
      eA?.type === "message" && "user" === eA.role && (eA.timestamp = el);
    }
  }
  const renderer = new (class NativeAcpInputRenderer {
    [key: string]: any;
    annotatePromptDerivedContent(eA: any, el: any): any {
      if (!Array.isArray(el) || 0 === el.length) return;
      let ec: any = eA.find(
        (eA: any) =>
          "message" === eA.type &&
          "user" === eA.role &&
          Array.isArray(eA.content),
      );
      if (
        !ec?.content ||
        ec.content.filter((eA: any) => eA?.type === "input_text").length <= 1
      )
        return;
      let eu: any = 0;
      for (let eA of el)
        if (eA && "object" == typeof eA)
          switch (eA.type) {
            case "text":
              eu++;
              break;
            case "resource_link": {
              let el: any = eA._meta || {};
              if ("inspiration" === el.mentionType && el.detail) break;
              let ed: any = ec.content[eu];
              if (
                ed?.type === "input_text" &&
                "string" == typeof eA.uri &&
                eA.uri.startsWith("command://")
              ) {
                let el: any = (0, ne.encodeAcpResourceLinkToInputText)({
                  uri: eA.uri,
                  name: eA.name,
                });
                el.providerData &&
                  (ed.providerData = {
                    ...(ed.providerData || {}),
                    ...el.providerData,
                  });
              }
              eu++;
              break;
            }
            case "resource":
              eA.resource && "text" in eA.resource && eu++;
              break;
            case "image":
              (eA.data ||
                ("string" == typeof eA.uri && eA.uri.startsWith("http"))) &&
                eu++;
          }
    }
    injectTrackingMeta(eA: any, el: any, ec: any, eu?: any): any {
      let ed: any = el.conversationRequestId || ec?.requestId,
        ep: any = el.messageId || ec?.messageId,
        eg: any = ec?.messageRequestId || ed,
        eh: any = { ...(eA._meta || {}) };
      (ed &&
        !eh["codebuddy.ai/requestId"] &&
        (eh["codebuddy.ai/requestId"] = ed),
        ep &&
          !eh["codebuddy.ai/messageId"] &&
          (eh["codebuddy.ai/messageId"] = ep),
        eg &&
          !eh["codebuddy.ai/messageRequestId"] &&
          (eh["codebuddy.ai/messageRequestId"] = eg));
      let ef: any = { ...eA, _meta: eh };
      return (
        !ef.messageId &&
          ("user_message_chunk" === ef.sessionUpdate && eg
            ? (ef.messageId = eg)
            : ("agent_message_chunk" === ef.sessionUpdate ||
                "agent_thought_chunk" === ef.sessionUpdate) &&
              ep &&
              (ef.messageId = ep)),
        (0, nh.withAcpTimestampMeta)(ef, eu)
      );
    }
    async tryExecuteLocalCommand(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
      ep: any,
    ): Promise<any> {
      if (!eA.startsWith("/")) return;
      let eg: any = this.commandManager.parseCommand(eA);
      if (!(!eg || this.commandManager.isOverriddenByCustom(eg.name))) {
        if (["/stats", "/rewind"].includes(eg.name)) {
          this.logger.info?.(`[AcpView] Skipping TUI-only command: ${eg.name}`);
          let eA: any = ec.getConnection(),
            ed: any = this.injectTrackingMeta(
              {
                sessionUpdate: "agent_message_chunk",
                content: {
                  type: "text",
                  text: `The ${eg.name} command is only available in the terminal.`,
                },
              },
              el,
              eu,
            );
          return (
            await eA.sessionUpdate({ sessionId: el.id, update: ed }),
            { stopReason: "end_turn" }
          );
        }
        this.logger.info?.(`[AcpView] Executing local command: ${eg.name}`);
        try {
          let eA: any = ec.getConnection(),
            eh: any = [],
            ef: any = el.combineSubject.subscribe((ec: any) => {
              if ("input" === ec.type) {
                for (let ed of np.AcpUtils.convertHistoryItemToAcp(ec.data))
                  if ("agent_message_chunk" === ed.sessionUpdate) {
                    let ep: any = (0, nh.getAcpItemTimestamp)(ec.data);
                    eh.push(
                      eA.sessionUpdate({
                        sessionId: el.id,
                        update: this.injectTrackingMeta(ed, el, eu, ep),
                      }),
                    );
                  }
              }
            });
          try {
            (await this.commandManager.executeLocalCommand({
              session: el,
              ...eg,
              timestamp: ep,
            }),
              await this.sessionManager.flushHistory(el),
              await Promise.all(eh));
          } finally {
            ef.unsubscribe();
          }
          let em: any = (0, nh.getLatestAcpOutputTimestamp)(el.history, ed),
            eE: any = ec.getConnectionId();
          return (
            eE &&
              (await this.broadcastService.broadcastSessionEnd(
                el.id,
                eE,
                el,
                em,
              )),
            {
              stopReason: "end_turn",
              ...(void 0 !== em ? { timestamp: em } : {}),
            }
          );
        } catch (eA: any) {
          return (
            this.logger.error?.(
              `[AcpView] Local command execution failed: ${eA}`,
            ),
            {
              stopReason: "refusal",
              errorMessage: eA instanceof Error ? eA.message : String(eA),
            }
          );
        }
      }
    }
  })();
  return { renderer, applyAcpPromptTimestamp };
}

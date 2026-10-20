// Fixed WorkBuddy 5.3.14 SHA; original complete methods, TS-only annotations and outer DI.
export function createNativeMcpUi(runtime: any) {
  const ep = { McpUtils: runtime.mcpUtils },
    eu = { ContainerUtil: { get: (_key?: any) => runtime.broadcast } },
    ed = { AcpBroadcastService: "broadcast" };
  function extractUiResourceUri(eA: any): any {
    if (!eA || "object" != typeof eA) return;
    let el: any = eA.ui;
    if (el && "string" == typeof el.resourceUri && el.resourceUri.length > 0)
      return el.resourceUri;
    let ec: any = eA["ui/resourceUri"];
    return "string" == typeof ec && ec.length > 0 ? ec : void 0;
  }
  async function lookupUiFromToolDefinition(
    eA: any,
    el: any,
    ec: any,
  ): Promise<any> {
    try {
      let { toolName: eu } = ep.McpUtils.parseToolFullName(el),
        ed: any = await eA.listTools(),
        eg: any = ed.find((eA: any) => eA.name === el || eA.name === eu),
        eh: any = eg?._meta,
        ef: any = extractUiResourceUri(eh);
      if (!ef)
        return void ec?.debug?.(
          `[McpUi] lookupUi: tool found=${!!eg} count=${ed.length} _meta.keys=${eh ? Object.keys(eh).join(",") : "(none)"}`,
        );
      let em: any = eh?.ui;
      return { resourceUri: ef, uiMeta: em };
    } catch (eA: any) {
      ec?.debug?.(`[McpUi] lookupUiFromToolDefinition(${el}) failed: ${eA}`);
      return;
    }
  }
  async function broadcastMcpUiForToolCall(eA: any): Promise<any> {
    let {
      server: el,
      fullToolName: ec,
      params: ep,
      resultContent: eg,
      resultMeta: eh,
      sessionId: ef,
      toolCallId: em,
      logger: eE,
    } = eA;
    try {
      let eC: any,
        ey: any = eA.uiResourceUri ?? extractUiResourceUri(eh?._meta);
      if (
        (eE?.debug?.(
          `[McpUi] enter broadcastMcpUiForToolCall tool=${ec} uiResourceUri=${ey ?? "(none)"}`,
        ),
        !ey)
      ) {
        let eA: any = await lookupUiFromToolDefinition(el, ec, eE);
        eA
          ? ((ey = eA.resourceUri),
            (eC = eA.uiMeta),
            eE?.debug?.(`[McpUi] fallback hit from tool definition: ${ey}`))
          : eE?.debug?.(
              `[McpUi] fallback miss for ${ec} (no _meta.ui in tool definition)`,
            );
      }
      if (!ey) return;
      let ew: any = eh?._meta?.ui ?? eC,
        eB: any = {
          toolResourceUri: ey,
          toolName: ec,
          ...(ew?.csp ? { csp: ew.csp } : {}),
          ...(ew?.permissions ? { permissions: ew.permissions } : {}),
          ...("boolean" == typeof ew?.prefersBorder
            ? { prefersBorder: ew.prefersBorder }
            : {}),
          toolInput: ep,
          toolResult: { ...(eh ?? {}), content: eg },
        },
        e_: any = eu.ContainerUtil.get(ed.AcpBroadcastService);
      return (await e_.broadcastMcpUi(ef, em, ec, eB), eB);
    } catch (eA: any) {
      eE?.warn?.(`[McpUi] broadcastMcpUi failed for ${ec}: ${eA}`);
      return;
    }
  }
  return {
    extractUiResourceUri,
    lookupUiFromToolDefinition,
    broadcastMcpUiForToolCall,
  };
}

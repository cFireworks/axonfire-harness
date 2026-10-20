import { HookEvent } from "./hook-constants.js";
export function createPromptHookProtocol(
  cwd: () => string = () => process.cwd(),
) {
  const oH = { HookEvent },
    process = { cwd };
  function buildPromptHookArgumentsJson(eA: any): any {
    let el: any = {
      session_id: eA.session_id || "",
      transcript_path: eA.transcript_path,
      cwd: eA.cwd || process.cwd(),
    };
    switch (
      (eA.permission_mode && (el.permission_mode = eA.permission_mode),
      (el.hook_event_name = eA.hook_event_name),
      eA.hook_event_name)
    ) {
      case oH.HookEvent.USER_PROMPT_SUBMIT:
        el.prompt = eA.prompt || "";
        break;
      case oH.HookEvent.PRE_TOOL_USE:
        ((el.tool_name = eA.tool_name || ""),
          (el.tool_input = eA.tool_input || {}));
        break;
      case oH.HookEvent.POST_TOOL_USE:
        ((el.tool_name = eA.tool_name || ""),
          (el.tool_input = eA.tool_input || {}),
          (el.tool_response = eA.tool_response));
        break;
      case oH.HookEvent.STOP:
      case oH.HookEvent.SUBAGENT_STOP:
        ((el.stop_hook_active = eA.stop_hook_active || !1),
          eA.last_assistant_message &&
            (el.last_assistant_message = eA.last_assistant_message),
          (el.background_tasks = eA.background_tasks ?? []),
          (el.session_crons = eA.session_crons ?? []));
        break;
      case oH.HookEvent.SESSION_START:
        el.source = eA.source || "startup";
        break;
      case oH.HookEvent.SESSION_END:
        el.reason = eA.reason || "other";
        break;
      case oH.HookEvent.PRE_COMPACT:
        ((el.trigger = eA.trigger || "auto"),
          (el.custom_instructions = eA.custom_instructions || null));
        break;
      case oH.HookEvent.NOTIFICATION:
        ((el.message = eA.message || ""),
          (el.notification_type = eA.notification_type || ""));
    }
    return JSON.stringify(el, null, 2);
  }
  function parsePromptHookResponse(eA: any): any {
    let el: any = (eA ?? "").trim();
    if (!el)
      return {
        ok: !0,
        reason: "Empty prompt hook response, defaulting to allow",
      };
    let ec: any =
      tryParse(el) ?? extractFromMarkdown(el) ?? extractFromText(el);
    return void 0 === ec
      ? {
          ok: !0,
          reason: "Failed to parse prompt hook response, defaulting to allow",
        }
      : normalize(ec);
  }
  function tryParse(eA: any): any {
    try {
      return JSON.parse(eA);
    } catch {
      return;
    }
  }
  function extractFromMarkdown(eA: any): any {
    let el: any = eA.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (el) return tryParse(el[1]);
  }
  function extractFromText(eA: any): any {
    let el: any = eA.match(/\{[^{}]*"ok"\s*:\s*(?:true|false)[^{}]*\}/);
    if (el) return tryParse(el[0]);
  }
  function normalize(eA: any): any {
    if ("object" != typeof eA || null === eA)
      return { ok: !0, reason: "Invalid response format" };
    let el: any = eA,
      ec: any = !0 === el.ok,
      eu: any = "string" == typeof el.reason ? el.reason : void 0,
      ed: any = ec ? void 0 : !0 === el.impossible || void 0;
    return {
      ok: ec,
      ...(void 0 !== eu ? { reason: eu } : {}),
      ...(ed ? { impossible: !0 } : {}),
    };
  }
  return {
    buildPromptHookArgumentsJson,
    parsePromptHookResponse,
    tryParse,
    extractFromMarkdown,
    extractFromText,
    normalize,
  };
}
export const { buildPromptHookArgumentsJson, parsePromptHookResponse } =
  createPromptHookProtocol();

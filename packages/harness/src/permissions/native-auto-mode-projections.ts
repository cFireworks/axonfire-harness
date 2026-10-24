// All 15 explicit native tool projections plus BaseTool's empty projection.
// Unknown tool names remain absent so the original classifier retains its raw-input fallback.
import { ToolNames } from '../tools/tool-names.js';
const nC = {
  ToolNames
};
const base = {
  toAutoClassifierInput(eA: any) {
    return "";
  }
};
const projections = new Map<string, {
  toAutoClassifierInput(input: any): any;
}>([
  [
    nC.ToolNames.READ,
    {
      toAutoClassifierInput(eA: any) {
        let el = eA?.file_path;
        return "string" == typeof el ? el : "";
      }
    }
  ],
  [
    nC.ToolNames.WRITE,
    {
      toAutoClassifierInput(eA: any) {
        let { file_path: el, content: ec } = eA ?? {};
        return "string" != typeof el ? "" : `${el}: ${"string" == typeof ec ? ec : ""}`;
      }
    }
  ],
  [
    nC.ToolNames.EDIT,
    {
      toAutoClassifierInput(eA: any) {
        let { file_path: el, new_string: ec } = eA ?? {};
        return "string" != typeof el ? "" : `${el}: ${"string" == typeof ec ? ec : ""}`;
      }
    }
  ],
  [
    nC.ToolNames.BASH,
    {
      toAutoClassifierInput(eA: any) {
        let el = eA?.command;
        return "string" == typeof el ? el : "";
      }
    }
  ],
  [
    nC.ToolNames.GLOB,
    {
      toAutoClassifierInput(eA: any) {
        let el = eA?.pattern;
        return "string" == typeof el ? el : "";
      }
    }
  ],
  [
    nC.ToolNames.GREP,
    {
      toAutoClassifierInput(eA: any) {
        let { pattern: el, path: ec } = eA ?? {};
        return "string" != typeof el ? "" : "string" == typeof ec && ec ? `${el} in ${ec}` : el;
      }
    }
  ],
  [
    nC.ToolNames.WEB_FETCH,
    {
      toAutoClassifierInput(eA: any) {
        let { url: el, prompt: ec } = eA ?? {};
        return "string" != typeof el ? "" : "string" == typeof ec && ec ? `${el}: ${ec}` : el;
      }
    }
  ],
  [
    nC.ToolNames.WEB_SEARCH,
    {
      toAutoClassifierInput(eA: any) {
        let el = eA?.query;
        return "string" == typeof el ? el : "";
      }
    }
  ],
  [
    nC.ToolNames.MULTI_EDIT,
    {
      toAutoClassifierInput(eA: any) {
        let { file_path: el, edits: ec } = eA ?? {};
        if ("string" != typeof el)
          return "";
        let eu = Array.isArray(ec) ? ec.map((eA: any) => "string" == typeof eA?.new_string ? eA.new_string : "").join("\n") : "";
        return `${el}: ${eu}`;
      }
    }
  ],
  [
    "NotebookEdit",
    {
      toAutoClassifierInput(eA: any) {
        let { notebook_path: el, edit_mode: ec, new_source: eu } = eA ?? {};
        if ("string" != typeof el)
          return "";
        let ed = "string" == typeof ec ? ec : "replace";
        return `${el} ${ed}: ${"string" == typeof eu ? eu : ""}`;
      }
    }
  ],
  [
    nC.ToolNames.AGENT,
    {
      toAutoClassifierInput(eA: any) {
        let { subagent_type: el, mode: ec, prompt: eu } = eA ?? {};
        if ("string" != typeof eu)
          return "";
        let ed = "string" == typeof el && el ? el : "general-purpose", ep = "string" == typeof ec && ec ? `, mode=${ec}` : "";
        return `(${ed}${ep}): ${eu}`;
      }
    }
  ],
  [
    nC.ToolNames.TASK_STOP,
    {
      toAutoClassifierInput(eA: any) {
        let { task_id: el, shell_id: ec } = eA ?? {};
        return el || ec || "";
      }
    }
  ],
  [
    nC.ToolNames.SEND_MESSAGE,
    {
      toAutoClassifierInput(eA: any) {
        let { type: el, recipient: ec, content: eu, approve: ed } = eA ?? {};
        switch (el) {
          case "message": {
            let eA = ec ? `to ${ec}` : "to (unspecified)";
            return eu ? `${eA}: ${eu}` : eA;
          }
          case "broadcast": return eu ? `broadcast: ${eu}` : "broadcast";
          case "shutdown_request": return `shutdown request${ec ? ` to ${ec}` : ""}${eu ? `: ${eu}` : ""}`;
          case "shutdown_response": return `shutdown response: ${ed ? "approve" : "reject"}${eu ? ` (${eu})` : ""}`;
          case "plan_approval_response": return `plan approval response${ec ? ` to ${ec}` : ""}: ${ed ? "approve" : "reject"}${eu ? ` (${eu})` : ""}`;
          default: return eu ?? "";
        }
      }
    }
  ],
  [
    nC.ToolNames.CRON_CREATE,
    {
      toAutoClassifierInput(eA: any) {
        let { cron: el, prompt: ec } = eA ?? {};
        return "string" != typeof ec ? "" : "string" == typeof el && el ? `${el}: ${ec}` : ec;
      }
    }
  ],
  [
    nC.ToolNames.POWERSHELL,
    {
      toAutoClassifierInput(eA: any) {
        let el = eA?.command;
        return "string" == typeof el ? el : "";
      }
    }
  ]
]);
export function nativeAutoClassifierTool(name: string) {
  const projection = projections.get(name);
  return projection ? {
    name, toAutoClassifierInput: projection.toAutoClassifierInput.bind(projection)
  } : undefined;
}
export function nativeEmptyAutoClassifierTool(name: string) {
  return {
    name, toAutoClassifierInput: base.toAutoClassifierInput.bind(base)
  };
}

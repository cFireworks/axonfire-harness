// Fixed WorkBuddy 5.3.14 SHA; original complete methods, TS-only annotations and outer DI.
import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
export function createNativeMcpResultProcessor(runtime: any) {
  const t5 = runtime.crypto ?? crypto,
    t9 = runtime.fs ?? fs,
    t7 = path,
    An = { PathUtils: { getHomeProjectDir: runtime.getHomeProjectDir } },
    Date = { now: runtime.now ?? globalThis.Date.now },
    process = { env: runtime.env ?? globalThis.process.env };
  function safeLen(eA: any): any {
    return "string" == typeof eA ? eA.length : 0;
  }
  function computeCharCount(eA: any): any {
    let el: any = 0;
    for (let ec of eA)
      switch (ec.type) {
        case "text":
          el += safeLen(ec.text);
          break;
        case "audio":
          el += safeLen(ec.data);
          break;
        case "image":
          break;
        case "resource": {
          let eA: any = ec.resource;
          eA &&
            "object" == typeof eA &&
            (el += safeLen("text" in eA ? eA.text : eA.blob));
          break;
        }
        case "resource_link":
          el += safeLen(ec.uri);
      }
    return el;
  }
  function contentContainsImages(eA: any): any {
    return eA.some((eA: any) => "image" === eA.type);
  }
  function getLargeOutputInstructions(eA: any, el: any, ec: any): any {
    return `Error: result (${el.toLocaleString()} characters) exceeds maximum allowed tokens. Output has been saved to ${eA}.
Format: ${ec}
Use offset and limit parameters to read specific portions of the file, search within it for specific content, and jq to make structured queries.
REQUIREMENTS FOR SUMMARIZATION/ANALYSIS/REVIEW:
- You MUST read the content from the file at ${eA} in sequential chunks until 100% of the content has been read.
- If you receive truncation warnings when reading the file, reduce the chunk size until you have read 100% of the content without truncation.
- Before producing ANY summary or analysis, you MUST explicitly describe what portion of the content you have read. ***If you did not read the entire content, you MUST explicitly state this.***
`;
  }
  function getTruncationMessage(eA: any): any {
    return `

[OUTPUT TRUNCATED - exceeded ${eA} token limit]

The tool output was truncated. If this MCP server provides pagination or filtering tools, use them to retrieve specific portions of the data. If pagination is not available, inform the user that you are working with truncated output and results may be incomplete.`;
  }
  function truncateMcpContent(eA: any, el: any): any {
    let ec: any = Number.isFinite(el) && el > 0 ? el : 2e4,
      eu: any = 4 * ec,
      ed: any = [],
      ep: any = new Map(),
      eg: any = 0;
    for (let el of eA)
      if ("text" === el.type) {
        let eA: any = eu - eg;
        if (eA <= 0) {
          ep.set("text", (ep.get("text") ?? 0) + 1);
          continue;
        }
        let ec: any = "string" == typeof el.text ? el.text : "";
        ec.length <= eA
          ? (ed.push({ type: "text", text: ec }), (eg += ec.length))
          : (ed.push({ type: "text", text: ec.slice(0, eA) }), (eg = eu));
      } else if ("image" === el.type) ed.push(el);
      else if (
        "resource" === el.type ||
        "resource_link" === el.type ||
        "audio" === el.type
      ) {
        let eA: any =
          "audio" === el.type
            ? safeLen(el.data)
            : "resource_link" === el.type
              ? safeLen(el.uri)
              : safeLen(
                  el.resource && "text" in el.resource
                    ? el.resource.text
                    : el.resource?.blob,
                );
        eg + eA <= eu
          ? (ed.push(el), (eg += eA))
          : ep.set(el.type, (ep.get(el.type) ?? 0) + 1);
      } else ed.push(el);
    if (ep.size > 0) {
      let eA: any = [...ep.entries()]
        .map(([eA, el]: any) => `${el} ${eA} block${el > 1 ? "s" : ""}`)
        .join(", ");
      ed.push({
        type: "text",
        text: `
[Dropped ${eA} due to size limit]`,
      });
    }
    return (ed.push({ type: "text", text: getTruncationMessage(ec) }), ed);
  }
  function serializeForPersistence(eA: any): any {
    return eA.every((eA: any) => "text" === eA.type)
      ? eA
          .map((eA: any) => eA.text)
          .filter((eA: any) => "string" == typeof eA)
          .join("\n")
      : JSON.stringify(eA, null, 2);
  }
  function getFormatDescription(eA: any): any {
    return eA.every((eA: any) => "text" === eA.type)
      ? "Plain text"
      : "JSON array of MCP content blocks";
  }
  async function persistMcpOutput(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): Promise<any> {
    try {
      let ep: any = getToolResultsDir(el, ec);
      await t9.mkdir(ep, { recursive: !0 });
      let eg: any = Date.now(),
        eh: any = t5.randomBytes(3).toString("hex"),
        ef: any = sanitizeForFilename(eu || "unknown"),
        em: any = sanitizeForFilename(ed || "unknown"),
        eE: any = `mcp-${ef}-${em}-${eg}-${eh}.txt`,
        eC: any = t7.join(ep, eE),
        ey: any = serializeForPersistence(eA);
      return (
        await t9.writeFile(eC, ey, "utf-8"),
        { filepath: eC, originalSize: ey.length }
      );
    } catch (eA: any) {
      return {
        error:
          eA instanceof Error
            ? `${eA.message}${
                eA.stack
                  ? `
${eA.stack}`
                  : ""
              }`
            : String(eA),
      };
    }
  }
  function getToolResultsDir(eA: any, el: any): any {
    let ec: any = sanitizeSessionSegment(eA);
    return el && ec.startsWith("agent-")
      ? t7.join(
          An.PathUtils.getHomeProjectDir(),
          sanitizeSessionSegment(el),
          "subagents",
          ec,
          "tool-results",
        )
      : t7.join(An.PathUtils.getHomeProjectDir(), ec, "tool-results");
  }
  function sanitizeForFilename(eA: any): any {
    return eA.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64);
  }
  function sanitizeSessionSegment(eA: any): any {
    return (
      t7
        .basename(eA)
        .replace(/[^A-Za-z0-9_-]/g, "_")
        .slice(0, 128) || "unknown-session"
    );
  }
  async function processMcpResult(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
    ep: any,
  ): Promise<any> {
    try {
      let eg: any = Number.isFinite(el) && el > 0 ? el : 2e4,
        eh: any = 4 * eg,
        ef: any = computeCharCount(eA);
      if (ef <= eh) return eA;
      let em: any =
          "1" === process.env.CODEBUDDY_DISABLE_MCP_LARGE_OUTPUT_FILES,
        eE: any = "string" == typeof ed ? ed : void 0,
        eC: any = "string" == typeof ep ? ep : void 0;
      if (em || contentContainsImages(eA) || !eE)
        return truncateMcpContent(eA, eg);
      let ey: any = await persistMcpOutput(eA, eE, eC, ec, eu);
      if ("error" in ey) return truncateMcpContent(eA, eg);
      return [
        {
          type: "text",
          text: getLargeOutputInstructions(
            ey.filepath,
            ef,
            getFormatDescription(eA),
          ),
        },
      ];
    } catch {
      let ec: any = Number.isFinite(el) && el > 0 ? el : 2e4;
      try {
        return truncateMcpContent(eA, ec);
      } catch {
        return [{ type: "text", text: getTruncationMessage(ec) }];
      }
    }
  }
  return {
    safeLen,
    computeCharCount,
    contentContainsImages,
    getLargeOutputInstructions,
    getTruncationMessage,
    truncateMcpContent,
    serializeForPersistence,
    getFormatDescription,
    persistMcpOutput,
    getToolResultsDir,
    sanitizeForFilename,
    sanitizeSessionSegment,
    processMcpResult,
  };
}

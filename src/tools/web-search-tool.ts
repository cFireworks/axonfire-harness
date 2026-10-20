import { z } from "zod";
import { validateToolParameters } from "./zod-utils.js";
import type { ToolManager } from "./tool-manager.js";
import { isPersonalAccount } from "../models/ioa-utils.js";
import {
  HTTP_HEADERS,
  MEDIA_TYPE,
  WEB_REQUEST_HEADERS,
  createWebToolRuntime,
  registerWebTool,
  type WebToolRuntime,
  WEB_FETCH_API_TIMEOUT_MS,
  WEB_FETCH_LOCAL_TIMEOUT_MS,
  WEB_FETCH_MAX_LENGTH,
  WEB_FETCH_SUMMARY_THRESHOLD,
  WEB_FETCH_CACHE_TTL_MS,
  cleanHtml,
  matchDomainPattern,
  isPrivateHost,
  isNodeError,
  getErrorMessage,
} from "./web-tool-runtime.js";
export const webSearchParameters = z.object({
  query: z.string().min(2).describe("The search query to use"),
  allowed_domains: z
    .array(z.string())
    .optional()
    .describe("Only include search results from these domains."),
  blocked_domains: z
    .array(z.string())
    .optional()
    .describe("Never include search results from these domains"),
  freshness: z
    .string()
    .regex(
      /^(?:d(?:[1-9]|[12]\d|30)?|m(?:[1-9]|1[0-2])?|y[1-5]?)$/,
      "freshness must be d or d1-d30, m or m1-m12, or y or y1-y5",
    )
    .optional()
    .describe(
      "Filter search results by time range. Supports d[N], m[N], and y[N] for the last N calendar days, months, and years:\n- d[N]: N is an integer from 1 to 30;\n- m[N]: N is an integer from 1 to 12;\n- y[N]: N is an integer from 1 to 5.\n\nN may be omitted and defaults to 1. The current partial calendar unit counts as 1. For example, d1 means today, m1 means the current month to date, and y1 means the current year to date. Omit this parameter to disable time filtering.",
    ),
});
/** Native 11827419..11831956; method bodies mechanically ported, explicit runtime replaces DI. */
export class WebSearchTool {
  readonly WEB_SEARCH_API_PATH = "/agenttool/v1/search";
  WEB_SEARCH_TIMEOUT_MS = 20000;
  readonly name = "WebSearch";
  readonly parameters = webSearchParameters;
  readonly argumentRenderer = { displayProperties: [{ name: "query" }] };
  readonly aliases = ["read"];
  constructor(readonly runtime: WebToolRuntime = createWebToolRuntime()) {}
  register(tools: ToolManager): void {
    registerWebTool(this, tools);
  }
  toAutoClassifierInput(eA?: any): any {
    let el: any = eA?.query;
    return "string" == typeof el ? el : "";
  }
  async execute(eA?: any, el?: any): Promise<any> {
    let ec: any = this.validateParams(eA);
    if (ec) throw Error(`Error: Invalid parameters provided. Reason: ${ec}`);
    try {
      let ec: any = await this.performWebSearch(eA, el.context);
      if (!ec || !ec.results || 0 === ec.results.length)
        return {
          content: `No search results found for query: "${eA.query}"`,
          title: `No results for "${eA.query}"`,
          renderer: { type: "text" },
          rawResponse: this.buildStructuredResult(eA.query, ec),
        };
      return {
        content: this.formatSearchResults(ec.results, eA.query, ec.provider),
        title: `Found ${this.runtime.chalk.primary(ec.results.length)} results for "${eA.query}" (provider: ${ec.provider})`,
        renderer: { type: "text" },
        rawResponse: this.buildStructuredResult(eA.query, ec),
      };
    } catch (ec: any) {
      let el: any = `Error during web search for query "${eA.query}": ${ec instanceof Error ? ec.message : String(ec)}`;
      throw Error(`Error: ${el}`);
    }
  }
  validateParams(eA?: any): any {
    let el: any = validateToolParameters(webSearchParameters, eA);
    return (
      el ||
      (eA.query && "" !== eA.query.trim()
        ? eA.query.length < 2
          ? "The 'query' parameter must be at least 2 characters long."
          : void 0
        : "The 'query' parameter cannot be empty.")
    );
  }
  async performWebSearch(eA?: any, el?: any): Promise<any> {
    let ec: any,
      eu: any = await this.runtime.configuration(),
      ed: any = `${eu.endpoint}${this.WEB_SEARCH_API_PATH}`,
      ep: any = this.runtime.uuid().replace(/-/g, ""),
      {
        ideType: eg,
        platform: eh,
        platformVersion: ef,
      } = await this.runtime.clientInfo(),
      em: any = this.runtime.authentication(),
      eE: any = em?.account,
      eC: any = em?.auth?.accessToken;
    if (!eC) throw Error("Authentication required for web search");
    let ey: any = ef || "1.0.0",
      ew: any = {
        [HTTP_HEADERS.ACCEPT]: MEDIA_TYPE.APPLICATION_JSON,
        [HTTP_HEADERS.CONTENT_TYPE]: MEDIA_TYPE.APPLICATION_JSON_UTF8,
        [HTTP_HEADERS.X_REQUESTED_WITH]: "XMLHttpRequest",
        [HTTP_HEADERS.USER_AGENT]: `${"CLI"}/${ey}`,
        [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${eC}`,
        [WEB_REQUEST_HEADERS.AGENT_INTENT]:
          el.meta?.["codebuddy.ai/mode"] ?? "craft",
        [WEB_REQUEST_HEADERS.CONVERSATION_ID_HEADER]: el.id,
        [WEB_REQUEST_HEADERS.CONVERSATION_REQUEST_ID_HEADER]:
          el.conversationRequestId || "",
        [WEB_REQUEST_HEADERS.CONVERSATION_MESSAGE_ID_HEADER]: ep,
        [WEB_REQUEST_HEADERS.REQUEST_ID_HEADER]: ep,
        [WEB_REQUEST_HEADERS.PRODUCT]: eu?.deploymentType || "",
        [WEB_REQUEST_HEADERS.IDE_TYPE_HEADER]: eg || "CLI",
        [WEB_REQUEST_HEADERS.IDE_NAME_HEADER]: eh || "CLI",
        [WEB_REQUEST_HEADERS.IDE_VERSION_HEADER]: ey,
        [WEB_REQUEST_HEADERS.USER_ID_HEADER]: eE?.uid || "",
        "X-Department-Info": eE?.departmentFullName || "",
      },
      eB: any = await this.runtime.settings.get("env"),
      e_: any = eE?.enterpriseId?.trim(),
      eI: any = isPersonalAccount(eE) && !e_;
    await this.runtime.applyIoaHeaders(ew, eB, {
      enterpriseId: e_,
      skipDefaultEnterpriseHeaders: eI,
    });
    let { query: ev, allowed_domains: eS, blocked_domains: eQ } = eA,
      eD: any = ev;
    if (eQ && eQ.length > 0) {
      let eA: any = eQ.map((eA: any) => `-site:${eA}`).join(" ");
      eD = `${eD} (${eA})`;
    }
    let eT: any = { query: eD, type: "text2text", max_results: 5 };
    (eS && eS.length > 0 && (eT.allowed_domains = eS),
      eA.freshness && (eT.freshness = eA.freshness));
    let eR: any = new AbortController(),
      ek: any = setTimeout(() => eR.abort(), this.WEB_SEARCH_TIMEOUT_MS);
    try {
      ec = await this.runtime.fetch(ed, {
        method: "POST",
        headers: ew,
        body: JSON.stringify(eT),
        signal: eR.signal,
      });
    } catch (eA: any) {
      if (eA instanceof DOMException && "AbortError" === eA.name)
        throw Error(
          `Web Search API request timed out after ${this.WEB_SEARCH_TIMEOUT_MS / 1e3}s (requestId: ${ew[WEB_REQUEST_HEADERS.REQUEST_ID_HEADER]})`,
        );
      throw eA;
    } finally {
      clearTimeout(ek);
    }
    if (!ec.ok)
      throw Error(
        `Web Search API request failed with status ${ec.status}: ${ec.statusText} (requestId: ${ew[WEB_REQUEST_HEADERS.REQUEST_ID_HEADER]})`,
      );
    let eM: any = await ec.json();
    if (eM.code)
      throw Error(
        `Web Search API returned error: ${eM.msg || "Unknown error"} (requestId: ${ew[WEB_REQUEST_HEADERS.REQUEST_ID_HEADER]})`,
      );
    let ex: any = eM;
    return {
      provider: ex.provider || "",
      results: (ex.results || []).map((eA: any) => ({
        title: eA.title || "Untitled",
        url: eA.url || "",
        snippet: eA.snippet || "",
        ...(eA.site ? { site: eA.site } : {}),
        ...(eA.favicon ? { favicon: eA.favicon } : {}),
      })),
      total_results: ex.total_results || 0,
      response_time_ms: ex.response_time_ms || 0,
    };
  }
  buildStructuredResult(eA?: any, el?: any): any {
    return {
      type: "web_search_tool_result",
      query: eA,
      searchType: "text2text",
      provider: el?.provider || "",
      results: el?.results || [],
      totalResults: el?.total_results || 0,
      responseTimeMs: el?.response_time_ms || 0,
    };
  }
  formatSearchResults(eA?: any, el?: any, ec?: any): any {
    return (
      `# Search Results for "${el}"

` +
      eA
        .map(
          (eA: any, el: any) => `## ${el + 1}. [${eA.title}](${eA.url})

${eA.snippet}

**URL:** ${eA.url}

---`,
        )
        .join("\n\n") +
      `

*Found ${eA.length} result${1 !== eA.length ? "s" : ""} • Provider: ${ec} • Search performed on ${new Date().toISOString().split("T")[0]}*`
    );
  }
}

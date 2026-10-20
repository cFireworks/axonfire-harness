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
export const webFetchParameters = z.object({
  url: z.string().describe("The URL to fetch content from"),
  prompt: z.string().describe("The prompt to run on the fetched content"),
});
/** Native 11809212..11824073; method bodies mechanically ported, explicit runtime replaces DI. */
export class WebFetchTool {
  static cache = new Map<string, any>();
  readonly WEB_FETCH_API_PATH = "/agenttool/v1/webfetch";
  readonly name = "WebFetch";
  readonly parameters = webFetchParameters;
  readonly argumentRenderer = {
    displayProperties: [{ type: "url", name: "url" }],
  };
  constructor(readonly runtime: WebToolRuntime = createWebToolRuntime()) {}
  register(tools: ToolManager): void {
    registerWebTool(this, tools);
  }
  resolveNeedPermissionArgs(eA?: any, el?: any, ec?: any): any {
    return [{ type: "url", value: el.url }];
  }
  toAutoClassifierInput(eA?: any): any {
    let { url: el, prompt: ec } = eA ?? {};
    return "string" != typeof el
      ? ""
      : "string" == typeof ec && ec
        ? `${el}: ${ec}`
        : el;
  }
  async execute(eA?: any, el?: any): Promise<any> {
    let ec: any,
      eu: any = this.validateParams(eA);
    if (eu) throw Error(`Error: Invalid parameters provided. Reason: ${eu}`);
    let ed: any = this.normalizeUrl(eA.url),
      ep: any = Date.now(),
      eg: any = "cache",
      eh: any = await this.checkNetworkPolicy(ed);
    if (!eh.allowed)
      throw Error(
        `Error: WebFetch blocked by security center network policy — ${eh.reason}. Adjust the policy in Settings → Security Center → Network Security if this is intended.`,
      );
    try {
      let eu: any,
        eh: any = this.getCachedEntry(ed),
        ef: any = !1,
        em: any = !1;
      if (
        (eh
          ? ((eu = eh.content), (em = eh.needsSummary), (ef = !0))
          : ((eu = (ec = await this.fetchWithFallback(
              ed,
              eA.prompt,
              el.context,
            )).content),
            (em = ec.needsSummary),
            (eg = ec.source),
            this.setCachedContent(ed, eu, em)),
        em)
      ) {
        let el: any = await this.processContentWithAI(eu, eA.prompt);
        return (
          this.reportTelemetry({
            status: "success",
            source: eg,
            needsSummary: !0,
            contentLength: el.length,
            rawContentLength: eu.length,
            fromCache: ef,
            totalDurationMs: Date.now() - ep,
            url: ed,
            outcome: ec,
          }),
          {
            content: el,
            title: `${this.runtime.chalk.success("✓")} Processed content from ${ed}${ef ? " (cached)" : ""}`,
            renderer: { type: "text" },
          }
        );
      }
      return (
        this.reportTelemetry({
          status: "success",
          source: eg,
          needsSummary: !1,
          contentLength: eu.length,
          rawContentLength: eu.length,
          fromCache: ef,
          totalDurationMs: Date.now() - ep,
          url: ed,
          outcome: ec,
        }),
        {
          content: eu,
          title: `${this.runtime.chalk.success("✓")} Fetched content from ${ed}${ef ? " (cached)" : ""}`,
          renderer: { type: "text" },
        }
      );
    } catch (el: any) {
      let eA: any = `Error during web fetch for ${ed}: ${el instanceof Error ? el.message : String(el)}`;
      throw (
        this.reportTelemetry({
          status: "failed",
          source: eg,
          needsSummary: !1,
          contentLength: 0,
          rawContentLength: 0,
          fromCache: !1,
          totalDurationMs: Date.now() - ep,
          url: ed,
          outcome: ec,
          errorReason: el instanceof Error ? el.message : String(el),
        }),
        Error(`Error: ${eA}`)
      );
    }
  }
  async isRemoteApiDisabled(): Promise<any> {
    if ("true" === this.runtime.env.CODEBUDDY_DISABLE_WEB_FETCH_REMOTE_API)
      return !0;
    let eA: any = await this.runtime.configuration();
    return !1 === eA.productFeatures?.["WebFetchRemoteApi"];
  }
  async fetchWithFallback(eA?: any, el?: any, ec?: any): Promise<any> {
    let eu: any, ed: any, ep: any, eg: any, eh: any, ef: any;
    if (await this.isRemoteApiDisabled()) {
      let el: any = Date.now(),
        ec: any = await this.fetchAndProcessLocally(eA);
      return {
        source: "local",
        content: ec,
        needsSummary: !0,
        apiStatus: "failed",
        apiErrorReason: "Remote API disabled via env or product feature",
        localStatus: "success",
        localContentLength: ec.length,
        localDurationMs: Date.now() - el,
      };
    }
    let em: any = new AbortController(),
      eE: any = setTimeout(
        () =>
          em.abort(
            Error(
              `WebFetch API timed out after ${WEB_FETCH_API_TIMEOUT_MS / 1e3}s`,
            ),
          ),
        WEB_FETCH_API_TIMEOUT_MS,
      ),
      eC: any = Date.now(),
      ey: any = this.fetchContentViaApi(eA, el, ec, em.signal)
        .then((eA: any) => {
          ((eu = eA.length), (ed = Date.now() - eC));
          let el: any =
            eA.length > WEB_FETCH_MAX_LENGTH
              ? eA.slice(0, WEB_FETCH_MAX_LENGTH)
              : eA;
          return {
            content: el,
            needsSummary: el.length > WEB_FETCH_SUMMARY_THRESHOLD,
          };
        })
        .catch((eA: any) => {
          throw (
            (ed = Date.now() - eC),
            (ep = eA instanceof Error ? eA.message : String(eA)),
            eA
          );
        })
        .finally(() => clearTimeout(eE)),
      ew: any = new AbortController(),
      eB: any = Date.now(),
      e_: any = this.fetchAndProcessLocally(eA, ew.signal)
        .then(
          (eA: any) => (
            (eg = eA.length),
            (eh = Date.now() - eB),
            (ef = "success"),
            eA
          ),
        )
        .catch((eA: any) => {
          throw (
            (eh = Date.now() - eB),
            ew.signal.aborted || (ef = "failed"),
            eA
          );
        });
    e_.catch(() => void 0);
    try {
      let eA: any = await ey;
      return (
        ew.abort(),
        {
          source: "api",
          content: eA.content,
          needsSummary: eA.needsSummary,
          apiStatus: "success",
          apiContentLength: eu,
          apiDurationMs: ed,
          localStatus: ef,
          localContentLength: eg,
          localDurationMs: eh,
        }
      );
    } catch (eA: any) {
      return (
        this.runtime.logger.warn?.(
          "[WebFetch] remote API failed or timed out, using local fetch result:",
          eA,
        ),
        {
          source: "local",
          content: await e_,
          needsSummary: !0,
          apiStatus: "failed",
          apiContentLength: eu,
          apiDurationMs: ed,
          apiErrorReason: ep,
          localStatus: "success",
          localContentLength: eg,
          localDurationMs: eh,
        }
      );
    }
  }
  validateParams(eA?: any): any {
    let el: any = validateToolParameters(webFetchParameters, eA);
    return (
      el ||
      (eA.url && "" !== eA.url.trim()
        ? eA.prompt && "" !== eA.prompt.trim()
          ? void 0
          : "The 'prompt' parameter cannot be empty."
        : "The 'url' parameter cannot be empty.")
    );
  }
  normalizeUrl(eA?: any): any {
    let el: any = eA.trim();
    return (
      el.startsWith("http://") && (el = el.replace("http://", "https://")),
      el.includes("github.com") &&
        el.includes("/blob/") &&
        (el = el
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/")),
      el
    );
  }
  getCachedEntry(eA?: any): any {
    let el: any = WebFetchTool.cache.get(eA);
    if (el)
      return Date.now() - el.timestamp > WEB_FETCH_CACHE_TTL_MS
        ? void WebFetchTool.cache.delete(eA)
        : el;
  }
  setCachedContent(eA?: any, el?: any, ec?: any): any {
    (WebFetchTool.cache.set(eA, {
      content: el,
      needsSummary: ec,
      timestamp: Date.now(),
      url: eA,
    }),
      this.cleanExpiredCache());
  }
  cleanExpiredCache(): any {
    let eA: any = Date.now();
    for (let [el, ec] of WebFetchTool.cache.entries())
      eA - ec.timestamp > WEB_FETCH_CACHE_TTL_MS &&
        WebFetchTool.cache.delete(el);
  }
  async fetchContentViaApi(
    eA?: any,
    el?: any,
    ec?: any,
    eu?: any,
  ): Promise<any> {
    let ed: any,
      ep: any = await this.runtime.configuration(),
      eg: any = `${ep.endpoint}${this.WEB_FETCH_API_PATH}`,
      eh: any = this.runtime.uuid().replace(/-/g, ""),
      {
        ideType: ef,
        platform: em,
        platformVersion: eE,
      } = await this.runtime.clientInfo(),
      eC: any = this.runtime.authentication(),
      ey: any = eC?.account,
      ew: any = eC?.auth?.accessToken;
    if (!ew) throw Error("Authentication required for web fetch");
    let eB: any = eE || "1.0.0",
      e_: any = {
        [HTTP_HEADERS.ACCEPT]: MEDIA_TYPE.APPLICATION_JSON,
        [HTTP_HEADERS.CONTENT_TYPE]: MEDIA_TYPE.APPLICATION_JSON_UTF8,
        [HTTP_HEADERS.X_REQUESTED_WITH]: "XMLHttpRequest",
        [HTTP_HEADERS.USER_AGENT]: `${"CLI"}/${eB}`,
        [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${ew}`,
        [WEB_REQUEST_HEADERS.AGENT_INTENT]: "craft",
        [WEB_REQUEST_HEADERS.CONVERSATION_ID_HEADER]: ec.id,
        [WEB_REQUEST_HEADERS.CONVERSATION_REQUEST_ID_HEADER]:
          ec.conversationRequestId || "",
        [WEB_REQUEST_HEADERS.CONVERSATION_MESSAGE_ID_HEADER]: eh,
        [WEB_REQUEST_HEADERS.REQUEST_ID_HEADER]: eh,
        [WEB_REQUEST_HEADERS.PRODUCT]: ep?.deploymentType || "",
        [WEB_REQUEST_HEADERS.IDE_TYPE_HEADER]: ef || "CLI",
        [WEB_REQUEST_HEADERS.IDE_NAME_HEADER]: em || "CLI",
        [WEB_REQUEST_HEADERS.IDE_VERSION_HEADER]: eB,
        [WEB_REQUEST_HEADERS.USER_ID_HEADER]: ey?.uid || "",
        "X-Department-Info": ey?.departmentFullName || "",
      },
      eI: any = await this.runtime.settings.get("env"),
      ev: any = ey?.enterpriseId?.trim(),
      eS: any = isPersonalAccount(ey) && !ev;
    await this.runtime.applyIoaHeaders(e_, eI, {
      enterpriseId: ev,
      skipDefaultEnterpriseHeaders: eS,
    });
    let eQ: any = {
        url: eA,
        format: "markdown",
        prompt: el,
        timeout: Math.floor(WEB_FETCH_API_TIMEOUT_MS / 1e3),
        max_length: WEB_FETCH_MAX_LENGTH,
      },
      eD: any = new AbortController();
    eu?.aborted
      ? eD.abort(eu.reason)
      : eu?.addEventListener("abort", () => eD.abort(eu.reason), { once: !0 });
    try {
      ed = await this.runtime.fetch(eg, {
        method: "POST",
        headers: e_,
        body: JSON.stringify(eQ),
        signal: eD.signal,
      });
    } catch (eA: any) {
      if (eA instanceof DOMException && "AbortError" === eA.name) {
        let eA: any = eu?.reason;
        if (eA instanceof Error) throw eA;
        throw Error("WebFetch API request aborted");
      }
      throw eA;
    }
    if (!ed.ok) {
      let eA: any = await ed.text().catch(() => ""),
        el: any = `WebFetch API request failed with status ${ed.status}`;
      if (eA)
        try {
          let ec: any = JSON.parse(eA);
          ec.msg && (el = `WebFetch API error: ${ec.msg} (code: ${ec.code})`);
        } catch {}
      throw Error(el);
    }
    let eT: any = await ed.json();
    if (eT.code)
      throw Error(`WebFetch API returned error: ${eT.msg || "Unknown error"}`);
    let eR: any = eT;
    if (!eR.content || 0 === eR.content.trim().length)
      throw Error("No readable content found on the page");
    return eR.content;
  }
  async fetchAndProcessLocally(eA?: any, el?: any): Promise<any> {
    let ec: any,
      eu: any = await this.fetchWithTimeout(eA, WEB_FETCH_LOCAL_TIMEOUT_MS, el);
    if (eu.redirected && new URL(eu.url).hostname !== new URL(eA).hostname)
      throw Error(
        `URL redirected to different host: ${eu.url}. Please make a new WebFetch request with the redirect URL: ${eu.url}`,
      );
    let ed: any = await eu.text();
    if (!ed || 0 === ed.trim().length)
      throw Error(
        `Request failed with status code ${eu.status} ${eu.statusText} and empty response body`,
      );
    let ep: any = eu.headers.get("content-type") || "";
    if (ep.includes("text/html") || ep.includes("application/xhtml+xml")) {
      let eA: any = cleanHtml(ed);
      try {
        ec = (await this.runtime.getTurndownService()).turndown(eA);
      } catch {
        ec = eA;
      }
    } else ec = ed;
    let eg: any = ec.substring(0, WEB_FETCH_MAX_LENGTH);
    if (!eg.trim()) {
      let eA: any = this.extractMetaContent(ed);
      if (eA) eg = eA;
      else throw Error("No readable content found on the page");
    }
    return eg;
  }
  extractMetaContent(eA?: any): any {
    let el: any = [],
      ec: any = eA.match(/<title[^>]*>([^<]+)<\/title>/i);
    ec && el.push(`Title: ${ec[1].trim()}`);
    let eu: any =
      eA.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      eA.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
      );
    eu && el.push(`Description: ${eu[1].trim()}`);
    let ed: any =
      eA.match(
        /<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      eA.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:title["']/i,
      );
    ed &&
      !el.some((eA: any) => eA.includes(ed[1])) &&
      el.push(`OG Title: ${ed[1].trim()}`);
    let ep: any =
      eA.match(
        /<meta[^>]+(?:property|name)=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      eA.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:description["']/i,
      );
    ep &&
      !el.some((eA: any) => eA.includes(ep[1])) &&
      el.push(`OG Description: ${ep[1].trim()}`);
    let eg: any =
      eA.match(
        /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      eA.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']keywords["']/i);
    return (
      eg && el.push(`Keywords: ${eg[1].trim()}`),
      el.length > 0 ? el.join("\n\n") : null
    );
  }
  async fetchWithTimeout(eA?: any, el?: any, ec?: any): Promise<any> {
    let eu: any = new AbortController(),
      abort: any = () => eu.abort(),
      ed: any = setTimeout(abort, el);
    ec?.aborted ? abort() : ec?.addEventListener("abort", abort, { once: !0 });
    try {
      return await this.runtime.fetch(eA, {
        signal: eu.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "text/markdown, text/html, application/xhtml+xml, */*",
          "Accept-Language": "zh-CN,zh;q=0.9,en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      });
    } catch (eA: any) {
      if (
        (eA instanceof DOMException && "AbortError" === eA.name) ||
        (isNodeError(eA) && "ABORT_ERR" === eA.code)
      )
        throw Error(
          ec?.aborted ? "Request aborted" : `Request timed out after ${el}ms`,
        );
      throw Error(getErrorMessage(eA));
    } finally {
      (clearTimeout(ed), ec?.removeEventListener("abort", abort));
    }
  }
  async processContentWithAI(eA?: any, el?: any): Promise<any> {
    try {
      let ec: any = await this.createAnalysisPrompt(eA, el);
      return (
        (await this.runtime.analyze("contentAnalyzer", ec)) ||
        this.createFallbackResponse(eA, el)
      );
    } catch (ec: any) {
      return (
        this.runtime.logger.warn?.(
          "[WebFetch] failed to process content with AI, falling back to summary:",
          ec,
        ),
        this.createFallbackResponse(eA, el)
      );
    }
  }
  async createAnalysisPrompt(eA?: any, el?: any): Promise<any> {
    try {
      return (
        (await this.runtime.renderPrompt("content-analyzer-prompt", {
          userPrompt: el,
          webContent: eA,
        })) || this.createFallbackPrompt(eA, el)
      );
    } catch (ec: any) {
      return (
        this.runtime.logger.warn?.(
          "[WebFetch] failed to render prompt template, using fallback:",
          ec,
        ),
        this.createFallbackPrompt(eA, el)
      );
    }
  }
  createFallbackPrompt(eA?: any, el?: any): any {
    return `You are helping analyze web content. The user has requested: "${el}"

Please analyze the following web content and provide a helpful response based on the user's request:

---
WEB CONTENT:
${eA}
---

Please provide a clear, concise analysis that directly addresses the user's request. Focus on extracting relevant information and presenting it in a well-structured format.
Always include the page's publish date/time, author, and source information in your response if available in the content. Do NOT omit any date or timestamp information.

CONTENT SAFETY (HIGHEST PRIORITY):
You MUST refuse to summarize web content that is primarily about politically sensitive topics (political figures, elections, government policies, geopolitical conflicts), or that promotes hate speech, racism, violence, discrimination, or catastrophic harm. Return ONLY: "This page contains sensitive content that cannot be returned."`;
  }
  createFallbackResponse(eA?: any, el?: any): any {
    let ec: any = this.createContentSummary(eA);
    return `# Web Content Analysis

## Request
${el}

## Content Summary
- **Source**: Fetched web content
- **Length**: ${eA.length} characters
- **Content Preview**: ${eA.substring(0, 200)}${eA.length > 200 ? "..." : ""}

## Analysis
Based on the prompt "${el}", here is the relevant information extracted from the web content:

${ec}

## Full Content
\`\`\`
${eA}
\`\`\`

*Note: This analysis was generated using a fallback summary method. For more sophisticated AI-powered analysis, please ensure the agent service is properly configured.*`;
  }
  createContentSummary(eA?: any): any {
    let el: any = eA.split(/\r?\n/).filter((eA: any) => eA.trim()),
      ec: any = el.filter((eA: any) => eA.match(/^#{1,6}\s/)),
      eu: any = el.find((eA: any) => eA.length > 50 && !eA.match(/^#{1,6}\s/)),
      ed: any = "";
    return (
      ec.length > 0 &&
        (ed += `**Main headings found:**
${ec
  .slice(0, 5)
  .map((eA: any) => `- ${eA}`)
  .join("\n")}

`),
      eu &&
        (ed += `**First substantial paragraph:**
${eu}

`),
      (ed += `**Content structure:** ${el.length} lines of text`)
    );
  }
  async checkNetworkPolicy(eA?: any): Promise<any> {
    try {
      let el: any, ec: any;
      try {
        (this.runtime.clearSettingsCache("user"),
          (el = await this.runtime.networkConfig()));
      } catch {
        return { allowed: !1, reason: "failed to load network config" };
      }
      if (el?.networkPolicyEnabled === !1) return { allowed: !0 };
      let eu: any = el?.network;
      if (!eu) return { allowed: !0 };
      let ed: any = "";
      try {
        ed = (ec = new URL(eA)).hostname.toLowerCase();
      } catch {
        return { allowed: !1, reason: "invalid URL: cannot parse host" };
      }
      let ep: any = ec.protocol.toLowerCase();
      if ("https:" !== ep && "http:" !== ep)
        return { allowed: !1, reason: `unsupported URL scheme: ${ep}` };
      if (!ed) return { allowed: !1, reason: "cannot determine host from URL" };
      if (isPrivateHost(ed))
        return {
          allowed: !1,
          reason: `host "${ed}" resolves to a private/internal address`,
        };
      let eg: any = (eu.allowedDomains ?? [])
          .map((eA: any) => String(eA).trim().toLowerCase())
          .filter(Boolean),
        eh: any = (eu.deniedDomains ?? [])
          .map((eA: any) => String(eA).trim().toLowerCase())
          .filter(Boolean);
      if (!0 === eu.denyAll) {
        if (eg.some((eA: any) => matchDomainPattern(ed, eA)))
          return { allowed: !0 };
        return { allowed: !1, reason: "network denyAll is enabled" };
      }
      let ef: any = eh.find((eA: any) => matchDomainPattern(ed, eA));
      if (ef)
        return {
          allowed: !1,
          reason: `host "${ed}" matched deny rule "${ef}"`,
        };
      return { allowed: !0 };
    } catch (eA: any) {
      return (
        this.runtime.logger.warn?.(
          `[WebFetch] network policy check failed: ${eA.message}`,
        ),
        { allowed: !1, reason: "network policy check error" }
      );
    }
  }
  reportTelemetry(eA?: any): any {
    try {
      if (!this.runtime.telemetry.isReady()) return;
      let el: any =
          "success" === eA.status ? "webfetch.complete" : "webfetch.failed",
        ec: any = this.safeUrlParts(eA.url),
        eu: any = {
          module: "webfetch",
          status: eA.status,
          source: eA.source,
          needsSummary: eA.needsSummary,
          fromCache: eA.fromCache,
          contentLength: eA.contentLength,
          rawContentLength: eA.rawContentLength,
          totalDurationMs: eA.totalDurationMs,
          urlHost: ec.host,
          urlPath: ec.path,
        },
        ed: any = eA.outcome;
      (ed &&
        ((eu.apiStatus = ed.apiStatus),
        void 0 !== ed.apiContentLength &&
          (eu.apiContentLength = ed.apiContentLength),
        void 0 !== ed.apiDurationMs && (eu.apiDurationMs = ed.apiDurationMs),
        void 0 !== ed.localStatus && (eu.localStatus = ed.localStatus),
        void 0 !== ed.localContentLength &&
          (eu.localContentLength = ed.localContentLength),
        void 0 !== ed.localDurationMs &&
          (eu.localDurationMs = ed.localDurationMs),
        ed.apiErrorReason &&
          (eu.apiErrorReason = this.truncate(ed.apiErrorReason, 256))),
        eA.errorReason && (eu.errorReason = this.truncate(eA.errorReason, 256)),
        "failed" === eA.status
          ? this.runtime.telemetry.logError(el, eu)
          : this.runtime.telemetry.logInfo(el, eu));
    } catch (eA: any) {
      this.runtime.logger.warn?.("[WebFetch] telemetry report failed:", eA);
    }
  }
  safeUrlParts(eA?: any): any {
    try {
      let el: any = new URL(eA);
      return { host: el.host, path: this.truncate(el.pathname || "/", 256) };
    } catch {
      return { host: "unknown", path: "" };
    }
  }
  truncate(eA?: any, el?: any): any {
    return eA.length > el ? `${eA.slice(0, el)}…` : eA;
  }
}

// Native parse/overlay/cache; exact modifier precedence and warning protocol.
export class ToolSpecParseError extends Error {
  [key: string]: any;
  constructor(eA: any, el: any) {
    (super(`Invalid tool spec ${JSON.stringify(eA)}: ${el}`),
      (this.raw = eA),
      (this.reason = el),
      (this.name = "ToolSpecParseError"));
  }
}
let eu: any = /^(Defer|NoDefer)\s*\(/,
  ed: any = /^(Defer|NoDefer)\s*\(.*\)\s*$/;
function parseSingleToolSpec(eA: any): any {
  let el: any = eA.trim();
  if (!el) throw new ToolSpecParseError(eA, "empty spec");
  if (el.includes(","))
    throw new ToolSpecParseError(
      eA,
      "comma is not allowed in a single spec; the caller should split the input first",
    );
  let ec: any = eu.exec(el);
  if (ec) {
    let [eu, ep] = ec;
    if (!el.endsWith(")"))
      throw new ToolSpecParseError(eA, `${ep}(...) is not properly closed`);
    let eg: any = el.slice(eu.length, -1).trim();
    if (!eg)
      throw new ToolSpecParseError(
        eA,
        `${ep}(...) requires a tool name or glob`,
      );
    if (ed.test(eg))
      throw new ToolSpecParseError(eA, "nested defer modifier is not allowed");
    if (/[(),]/.test(eg))
      throw new ToolSpecParseError(
        eA,
        `${ep}(...) only accepts a tool name or glob; permission filters like Read(*.md) belong in --allowed-tools, not --tools`,
      );
    return { pattern: eg, modifier: ep, isGlob: eg.includes("*"), raw: eA };
  }
  if (/[()]/.test(el))
    throw new ToolSpecParseError(
      eA,
      "parentheses are reserved for Defer(...)/NoDefer(...) modifiers; permission filters like Read(*.md) belong in --allowed-tools, not --tools",
    );
  return { pattern: el, modifier: void 0, isGlob: el.includes("*"), raw: eA };
}
function parseToolSpecs(eA: any, el: any = {}): any {
  let ec: any = [],
    eu: any = new Map(),
    ed: any = [];
  for (let ep of eA) {
    let eA: any;
    try {
      eA = parseSingleToolSpec(ep);
    } catch (eA: any) {
      if (el.lenient && eA instanceof ToolSpecParseError) {
        ec.push({ code: "invalid-pattern", message: eA.message, raw: ep });
        continue;
      }
      throw eA;
    }
    (eu.has(eA.pattern)
      ? eu.get(eA.pattern) !== eA.modifier
        ? ec.push({
            code: "conflicting-modifier",
            message: `tool ${JSON.stringify(eA.pattern)} appears with conflicting defer modifiers; keeping last occurrence (${eA.modifier ?? "none"})`,
            raw: ep,
          })
        : ec.push({
            code: "duplicate-spec",
            message: `tool ${JSON.stringify(eA.pattern)} appears multiple times`,
            raw: ep,
          })
      : ed.push(eA.pattern),
      eu.set(eA.pattern, eA.modifier));
  }
  let ep: any = {
    forceDefer: { exact: [], glob: [] },
    forceNoDefer: { exact: [], glob: [] },
  };
  for (let eA of ed) {
    let el: any = eu.get(eA);
    if (!el) continue;
    let ec: any = "Defer" === el ? ep.forceDefer : ep.forceNoDefer;
    (eA.includes("*") ? ec.glob : ec.exact).push(eA);
  }
  return { names: ed, overlay: ep, warnings: ec };
}
let ep: any = ["ToolSearch", "DeferExecuteTool"];
function augmentParsedSpecsForDefer(eA: any): any {
  if (
    !(
      eA.overlay.forceDefer.exact.length > 0 ||
      eA.overlay.forceDefer.glob.length > 0
    )
  )
    return eA;
  let el: any = new Set(eA.names),
    ec: any = [...eA.names];
  for (let eA of ep) el.has(eA) || ec.push(eA);
  let eu: any = new Set(eA.overlay.forceNoDefer.exact),
    ed: any = [...eA.overlay.forceNoDefer.exact];
  for (let eA of ep) eu.has(eA) || ed.push(eA);
  return {
    names: ec,
    overlay: {
      forceDefer: {
        exact: eA.overlay.forceDefer.exact,
        glob: eA.overlay.forceDefer.glob,
      },
      forceNoDefer: { exact: ed, glob: eA.overlay.forceNoDefer.glob },
    },
    warnings: eA.warnings,
  };
}
export class ToolDeferOverlay {
  [key: string]: any;
  static EMPTY: any;
  static fromSnapshot(eA: any): any {
    return eA && eA.forceDefer?.exact && eA.forceNoDefer?.exact
      ? new ToolDeferOverlay(eA)
      : ToolDeferOverlay.EMPTY;
  }
  static merge(...eA: any[]): any {
    let el: any = new Set(),
      ec: any = new Set(),
      eu: any = new Set(),
      ed: any = new Set();
    for (let ep of eA)
      if (ep) {
        if (ep.forceDefer?.exact)
          for (let eA of ep.forceDefer.exact) el.add(eA);
        if (ep.forceDefer?.glob) for (let eA of ep.forceDefer.glob) ec.add(eA);
        if (ep.forceNoDefer?.exact)
          for (let eA of ep.forceNoDefer.exact) eu.add(eA);
        if (ep.forceNoDefer?.glob)
          for (let eA of ep.forceNoDefer.glob) ed.add(eA);
      }
    return 0 === el.size && 0 === ec.size && 0 === eu.size && 0 === ed.size
      ? ToolDeferOverlay.EMPTY
      : new ToolDeferOverlay({
          forceDefer: { exact: [...el], glob: [...ec] },
          forceNoDefer: { exact: [...eu], glob: [...ed] },
        });
  }
  constructor(eA: any) {
    ((this.forceDeferExact = new Set(eA.forceDefer.exact)),
      (this.forceDeferGlob = eA.forceDefer.glob.map(globToRegExp)),
      (this.forceNoDeferExact = new Set(eA.forceNoDefer.exact)),
      (this.forceNoDeferGlob = eA.forceNoDefer.glob.map(globToRegExp)));
  }
  isEmpty(): any {
    return (
      0 === this.forceDeferExact.size &&
      0 === this.forceDeferGlob.length &&
      0 === this.forceNoDeferExact.size &&
      0 === this.forceNoDeferGlob.length
    );
  }
  matchesForceDefer(eA: any): any {
    return this.match(eA, this.forceDeferExact, this.forceDeferGlob);
  }
  matchesForceNoDefer(eA: any): any {
    return this.match(eA, this.forceNoDeferExact, this.forceNoDeferGlob);
  }
  listForceDeferExact(): any {
    return [...this.forceDeferExact];
  }
  decide(eA: any): any {
    return this.matchesForceNoDefer(eA)
      ? "force-no-defer"
      : this.matchesForceDefer(eA)
        ? "force-defer"
        : void 0;
  }
  match(eA: any, el: any, ec: any): any {
    if (el.has(eA)) return !0;
    for (let el of ec) if (el.test(eA)) return !0;
    return !1;
  }
}
function globToRegExp(eA: any): any {
  let el: any = eA.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return RegExp(`^${el}$`);
}
ToolDeferOverlay.EMPTY = new ToolDeferOverlay({
  forceDefer: { exact: [], glob: [] },
  forceNoDefer: { exact: [], glob: [] },
});
export const AgentToolDeferOverlayCache: any = Symbol(
  "AgentToolDeferOverlayCache",
);
export class AgentToolDeferOverlayCacheImpl {
  [key: string]: any;
  constructor() {
    this.cache = new Map();
  }
  get(eA: any): any {
    if (eA) return this.cache.get(eA);
  }
  set(eA: any, el: any): any {
    this.cache.set(eA, el);
  }
  clear(): any {
    this.cache.clear();
  }
}
export { parseSingleToolSpec, parseToolSpecs, augmentParsedSpecsForDefer };

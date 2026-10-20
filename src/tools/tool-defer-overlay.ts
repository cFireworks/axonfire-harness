export type ToolPatternSet = {
  exact: string[];
  glob: string[];
};

export type ToolDeferOverlayValue = {
  forceDefer: ToolPatternSet;
  forceNoDefer: ToolPatternSet;
};

export type ParsedToolSpecs = {
  tools: string[];
  overlay: ToolDeferOverlayValue;
};

const EMPTY_VALUE: ToolDeferOverlayValue = {
  forceDefer: { exact: [], glob: [] },
  forceNoDefer: { exact: [], glob: [] },
};

/** Runtime form of WorkBuddy's per-session defer/no-defer overlay. */
export class ToolDeferOverlay {
  static readonly EMPTY = new ToolDeferOverlay(EMPTY_VALUE);

  private readonly forceDeferExact: ReadonlySet<string>;
  private readonly forceDeferGlob: readonly RegExp[];
  private readonly forceNoDeferExact: ReadonlySet<string>;
  private readonly forceNoDeferGlob: readonly RegExp[];

  constructor(readonly snapshot: ToolDeferOverlayValue = EMPTY_VALUE) {
    this.forceDeferExact = new Set(snapshot.forceDefer.exact);
    this.forceDeferGlob = snapshot.forceDefer.glob.map(globToRegExp);
    this.forceNoDeferExact = new Set(snapshot.forceNoDefer.exact);
    this.forceNoDeferGlob = snapshot.forceNoDefer.glob.map(globToRegExp);
  }

  static empty(): ToolDeferOverlayValue {
    return {
      forceDefer: { exact: [], glob: [] },
      forceNoDefer: { exact: [], glob: [] },
    };
  }

  static fromSnapshot(
    value: ToolDeferOverlayValue | ToolDeferOverlay | undefined,
  ): ToolDeferOverlay {
    if (value instanceof ToolDeferOverlay) return value;
    if (!value) return ToolDeferOverlay.EMPTY;
    if (
      value.forceDefer.exact.length === 0 &&
      value.forceDefer.glob.length === 0 &&
      value.forceNoDefer.exact.length === 0 &&
      value.forceNoDefer.glob.length === 0
    ) {
      return ToolDeferOverlay.EMPTY;
    }
    return new ToolDeferOverlay(value);
  }

  static merge(
    ...values: Array<ToolDeferOverlayValue | ToolDeferOverlay | undefined>
  ): ToolDeferOverlayValue {
    const result = ToolDeferOverlay.empty();
    for (const item of values) {
      const value = item instanceof ToolDeferOverlay ? item.snapshot : item;
      if (!value) continue;
      mergePatternSet(result.forceDefer, value.forceDefer);
      mergePatternSet(result.forceNoDefer, value.forceNoDefer);
    }
    return result;
  }

  static isDeferred(
    name: string,
    defaultValue: boolean,
    overlay?: ToolDeferOverlayValue | ToolDeferOverlay,
  ): boolean {
    const decision = ToolDeferOverlay.fromSnapshot(overlay).decide(name);
    return decision ?? defaultValue;
  }

  isEmpty(): boolean {
    return (
      this.forceDeferExact.size === 0 &&
      this.forceDeferGlob.length === 0 &&
      this.forceNoDeferExact.size === 0 &&
      this.forceNoDeferGlob.length === 0
    );
  }

  matchesForceDefer(name: string): boolean {
    return this.matches(name, this.forceDeferExact, this.forceDeferGlob);
  }

  matchesForceNoDefer(name: string): boolean {
    return this.matches(name, this.forceNoDeferExact, this.forceNoDeferGlob);
  }

  listForceDeferExact(): string[] {
    return [...this.forceDeferExact];
  }

  /** force-no-defer deliberately wins when both sides match. */
  decide(name: string): boolean | undefined {
    if (this.matchesForceNoDefer(name)) return false;
    if (this.matchesForceDefer(name)) return true;
    return undefined;
  }

  private matches(
    name: string,
    exact: ReadonlySet<string>,
    globs: readonly RegExp[],
  ): boolean {
    return exact.has(name) || globs.some((pattern) => pattern.test(name));
  }
}

export function parseSingleToolSpec(spec: string): {
  tool?: string;
  forceDefer?: string;
  forceNoDefer?: string;
} {
  const value = spec.trim();
  const modifier = /^(Defer|NoDefer)\((.+)\)$/.exec(value);
  if (modifier?.[1] === "Defer" && modifier[2]) {
    return { forceDefer: modifier[2].trim() };
  }
  if (modifier?.[1] === "NoDefer" && modifier[2]) {
    return { forceNoDefer: modifier[2].trim() };
  }
  if (value.includes("(") || value.includes(")")) {
    throw new Error(`Invalid tool specification: ${spec}`);
  }
  return value ? { tool: value } : {};
}

export function parseToolSpecs(specs: readonly string[]): ParsedToolSpecs {
  const tools: string[] = [];
  const overlay = ToolDeferOverlay.empty();
  for (const spec of specs) {
    const parsed = parseSingleToolSpec(spec);
    if (parsed.tool) tools.push(parsed.tool);
    if (parsed.forceDefer) addPattern(overlay.forceDefer, parsed.forceDefer);
    if (parsed.forceNoDefer) addPattern(overlay.forceNoDefer, parsed.forceNoDefer);
  }
  return augmentParsedSpecsForDefer({ tools: [...new Set(tools)], overlay });
}

export function augmentParsedSpecsForDefer(
  parsed: ParsedToolSpecs,
): ParsedToolSpecs {
  const hasForcedDefer =
    parsed.overlay.forceDefer.exact.length > 0 ||
    parsed.overlay.forceDefer.glob.length > 0;
  if (!hasForcedDefer) return parsed;
  const tools = [...parsed.tools];
  for (const name of ["ToolSearch", "DeferExecuteTool"]) {
    if (!tools.includes(name)) tools.push(name);
    if (!parsed.overlay.forceNoDefer.exact.includes(name)) {
      parsed.overlay.forceNoDefer.exact.push(name);
    }
  }
  return { tools, overlay: parsed.overlay };
}

export function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`);
}

function addPattern(target: ToolPatternSet, value: string): void {
  const bucket = value.includes("*") ? target.glob : target.exact;
  if (!bucket.includes(value)) bucket.push(value);
}

function mergePatternSet(target: ToolPatternSet, source: ToolPatternSet): void {
  target.exact = [...new Set([...target.exact, ...source.exact])];
  target.glob = [...new Set([...target.glob, ...source.glob])];
}

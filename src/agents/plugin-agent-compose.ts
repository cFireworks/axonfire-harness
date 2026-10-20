import * as Aq from "node:path";
export type PluginAgentComposeRuntime = {
  readFileSync(path: string, encoding: "utf-8"): string;
  existsSync(path: string): boolean;
  markdown: {
    extractFrontMatterFull(text: string): any;
    parseListField(value: any): string[];
  };
  substituteLoadTimeVariables(
    text: string,
    filename: string,
    root?: string,
  ): string;
};
// Native composition helpers UTF-16 7018190..7024410.
export function createPluginAgentComposer(
  runtime: PluginAgentComposeRuntime,
  nunjucks: any,
) {
  const AJ = () => nunjucks;
  let AW: any = "workbuddy-builtin",
    AV: any = "welcomemode-",
    AZ: any = "interactionmode-",
    AX: any = ["fragments", "interaction.md"],
    A0: any = /^include\s+["']([^"']+)["']$/,
    A1: any = /\b(?:interactionMode|welcomeMode|workMode)\b/;
  function composePluginAgent(eA: any): any {
    if (!isRootComposePlugin(eA.matchedPlugin)) return eA.agentConfig;
    let el: any = eA.enabledPlugins
      .filter(isEnabledFragmentPlugin)
      .map(toEnabledComposePlugin)
      .filter((eA: any) => !!eA);
    if (el.length > 1) {
      let ec: any = el.map((eA: any) => eA.name).sort();
      eA.logger.warn(
        `[PluginAgentCompose] multiple interaction mode plugins enabled; composition skipped: ${ec.join(", ")}`,
      );
      return;
    }
    let ec: any = buildEnabledComposePluginMap(eA.enabledPlugins),
      eu: any = el[0];
    if (!eu && 0 === ec.size) return eA.agentConfig;
    let ed: any = eA.agentConfig.instructions || eA.agentConfig.prompt,
      ep: any = {
        pluginMap: ec,
        selectedFragmentPlugin: eu,
        logger: eA.logger,
        tools: [],
        includedModeFragments: 0,
      },
      eg: any = renderPluginTemplate(
        ed,
        ep,
        buildTemplateVariables(eA.matchedPlugin, eu),
        [],
      ),
      eh: any =
        eu && 0 === ep.includedModeFragments
          ? readModeFragment(eu, eA.logger)
          : void 0,
      ef: any = [eg, eh?.body].filter(Boolean).join("\n\n");
    return {
      ...eA.agentConfig,
      ...(ef ? { instructions: ef } : {}),
      tools: unionTools(eA.agentConfig.tools, ep.tools, eh?.tools),
    };
  }
  function isRootComposePlugin(eA: any): any {
    return eA?.marketplaceName === AW && eA.name.startsWith(AV);
  }
  function isEnabledFragmentPlugin(eA: any): any {
    return (
      "enabled" === eA.status &&
      eA.marketplaceName === AW &&
      eA.name.startsWith(AZ) &&
      "string" == typeof eA.installedPath &&
      eA.installedPath.length > 0
    );
  }
  function buildEnabledComposePluginMap(eA: any): any {
    let el: any = new Map();
    for (let ec of eA) {
      let eA: any = toEnabledComposePlugin(ec);
      eA && el.set(eA.name, eA);
    }
    return el;
  }
  function toEnabledComposePlugin(eA: any): any {
    if (
      "enabled" === eA.status &&
      eA.marketplaceName === AW &&
      "string" == typeof eA.installedPath &&
      0 !== eA.installedPath.length
    )
      return { name: eA.name, installedPath: eA.installedPath };
  }
  function buildTemplateVariables(eA: any, el: any): any {
    let ec: any = eA?.name.startsWith(AV) ? eA.name.slice(AV.length) : void 0,
      eu: any = el?.name.startsWith(AZ) ? el.name.slice(AZ.length) : void 0;
    return {
      ...(ec ? { welcomeMode: ec } : {}),
      ...(eu ? { interactionMode: eu, workMode: eu } : {}),
    };
  }
  function renderPluginTemplate(eA: any, el: any, ec: any, eu: any): any {
    let ed: any;
    if (!eA) return "";
    let ep: any = /{%-?\s*([\s\S]*?)\s*-?%}/g,
      eg: any = [],
      eh: any = 0,
      ef: any = "";
    for (; (ed = ep.exec(eA)); ) {
      let ep: any = ed[0],
        em: any = normalizeTemplateTag(ed[1]);
      isTemplateActive(eg) && (ef += eA.slice(eh, ed.index));
      let eE: any = parseIncludeTag(em),
        eC: any = parseIfExpression(em),
        ey: any = parseElifExpression(em),
        ew: any = eg[eg.length - 1];
      if (eE)
        isTemplateActive(eg) && (ef += renderPluginInclude(eE, el, ec, eu));
      else if (eC) {
        let eA: any = isTemplateActive(eg);
        if (isComposeExpression(eC)) {
          let eu: any = evaluateComposeExpression(eC, ec, el.logger);
          eg.push({
            kind: "compose",
            parentActive: eA,
            branchMatched: eu,
            active: eA && eu,
          });
        } else
          (eA && (ef += ep),
            eg.push({
              kind: "literal",
              parentActive: eA,
              branchMatched: !1,
              active: eA,
            }));
      } else if (ey && ew?.kind === "compose")
        if (!ew.parentActive || ew.branchMatched) ew.active = !1;
        else {
          let eA: any = evaluateComposeExpression(ey, ec, el.logger);
          ((ew.branchMatched = eA), (ew.active = eA));
        }
      else
        isElseTag(em) && ew?.kind === "compose"
          ? ((ew.active = ew.parentActive && !ew.branchMatched),
            (ew.branchMatched = !0))
          : isEndifTag(em) && ew?.kind === "compose"
            ? eg.pop()
            : (isTemplateActive(eg) && (ef += ep),
              isEndifTag(em) && ew?.kind === "literal" && eg.pop());
      eh = ed.index + ep.length;
    }
    return (isTemplateActive(eg) && (ef += eA.slice(eh)), ef);
  }
  function normalizeTemplateTag(eA: any): any {
    return eA.trim();
  }
  function parseIncludeTag(eA: any): any {
    return A0.exec(eA)?.[1];
  }
  function parseIfExpression(eA: any): any {
    return /^if\s+(.+)$/.exec(eA)?.[1]?.trim();
  }
  function parseElifExpression(eA: any): any {
    return /^elif\s+(.+)$/.exec(eA)?.[1]?.trim();
  }
  function isElseTag(eA: any): any {
    return "else" === eA;
  }
  function isEndifTag(eA: any): any {
    return "endif" === eA;
  }
  function isComposeExpression(eA: any): any {
    return A1.test(eA);
  }
  function isTemplateActive(eA: any): any {
    return eA.every((eA: any) => eA.active);
  }
  function evaluateComposeExpression(eA: any, el: any, ec: any): any {
    try {
      let ec: any = AJ()
        .compile(
          `{% if ${eA} %}true{% else %}false{% endif %}`,
          new (AJ().Environment)(null, { autoescape: !1 }),
        )
        .render(el);
      return "true" === ec.trim();
    } catch (el: any) {
      return (
        ec.warn(
          `[PluginAgentCompose] failed to evaluate compose expression '${eA}': ${el instanceof Error ? el.message : String(el)}`,
        ),
        !1
      );
    }
  }
  function renderPluginInclude(eA: any, el: any, ec: any, eu: any): any {
    let ed: any = resolvePluginInclude(eA, el.pluginMap);
    if (!ed)
      return (
        el.logger.debug(
          `[PluginAgentCompose] unresolved include kept as literal: ${eA}`,
        ),
        `{% include "${eA}" %}`
      );
    if (eu.includes(ed.filePath))
      return (
        el.logger.warn(
          `[PluginAgentCompose] include cycle detected: ${[...eu, ed.filePath].join(" -> ")}`,
        ),
        ""
      );
    try {
      let eA: any = runtime.readFileSync(ed.filePath, "utf-8"),
        ep: any = ed.filePath.endsWith(".md")
          ? runtime.markdown.extractFrontMatterFull(eA)
          : void 0;
      ep?.parseError &&
        el.logger.warn(
          `[PluginAgentCompose] malformed YAML frontmatter in '${ed.filePath}': ${ep.parseError}`,
        );
      let eg: any = ep ? runtime.markdown.parseListField(ep.data.tools) : [];
      ((el.tools = unionTools(el.tools, eg) ?? []),
        ed.plugin.name.startsWith(AZ) && (el.includedModeFragments += 1));
      let eh: any = runtime.substituteLoadTimeVariables(
        (ep ? ep.content : eA).trim(),
        ed.filePath,
        ed.plugin.installedPath,
      );
      return renderPluginTemplate(eh, el, ec, [...eu, ed.filePath]);
    } catch (ec: any) {
      return (
        el.logger.warn(
          `[PluginAgentCompose] failed to render include '${eA}': ${ec instanceof Error ? ec.message : String(ec)}`,
        ),
        ""
      );
    }
  }
  function resolvePluginInclude(eA: any, el: any): any {
    let ec: any = eA.split(/[\\/]+/).filter(Boolean);
    if (
      ec.length < 2 ||
      eA.includes("\0") ||
      (0, Aq.isAbsolute)(eA) ||
      ec.some((eA: any) => ".." === eA)
    )
      return;
    let eu: any = el.get(ec[0]);
    if (!eu) return;
    let ed: any = (0, Aq.join)(eu.installedPath, ...ec.slice(1)),
      ep: any = (0, Aq.relative)(eu.installedPath, ed);
    if (
      !(ep.startsWith("..") || (0, Aq.isAbsolute)(ep)) &&
      runtime.existsSync(ed)
    )
      return { plugin: eu, filePath: ed };
  }
  function readModeFragment(eA: any, el: any): any {
    let ec: any = eA.installedPath;
    if (!ec) return;
    let eu: any = (0, Aq.join)(ec, ...AX);
    if (!runtime.existsSync(eu))
      return void el.debug(
        `[PluginAgentCompose] mode fragment not found: ${eu}`,
      );
    try {
      let ed: any = runtime.readFileSync(eu, "utf-8"),
        ep: any = runtime.markdown.extractFrontMatterFull(ed);
      ep.parseError &&
        el.warn(
          `[PluginAgentCompose] malformed YAML frontmatter in '${eu}': ${ep.parseError}`,
        );
      let eg: any = runtime.markdown.parseListField(ep.data.tools);
      return {
        pluginName: eA.name,
        body: runtime.substituteLoadTimeVariables(ep.content.trim(), eu, ec),
        tools: eg,
      };
    } catch (ec: any) {
      el.warn(
        `[PluginAgentCompose] failed to read mode fragment for '${eA.name}': ${ec instanceof Error ? ec.message : String(ec)}`,
      );
      return;
    }
  }
  function unionTools(...eA: any[]): any {
    let el: any = [],
      ec: any = new Set();
    for (let eu of eA)
      for (let eA of eu ?? []) ec.has(eA) || (ec.add(eA), el.push(eA));
    return el.length > 0 ? el : void 0;
  }
  return {
    composePluginAgent,
    resolvePluginInclude,
    renderPluginTemplate,
    readModeFragment,
    unionTools,
  };
}

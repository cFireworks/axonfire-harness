// Original MarkdownUtils subset; parser is a dependency boundary.
export function createAgentMarkdownUtils(parseYaml: (text: string) => any) {
  const t$ = { parse: parseYaml };
  class MarkdownUtils {
    static extractFrontMatterFull(eA: any): any {
      let el: any = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/,
        ec: any = eA.match(el);
      if (!ec) return { data: {}, content: eA };
      let eu: any = ec[1] ?? "",
        ed: any = ec[2] ?? "";
      try {
        let eA: any = (0, t$.parse)(eu);
        if (eA && "object" == typeof eA && !Array.isArray(eA))
          return { data: eA, content: ed.trim() };
        return { data: {}, content: ed.trim() };
      } catch (eA: any) {
        return {
          data: {},
          content: ed.trim(),
          parseError: eA instanceof Error ? eA.message : String(eA),
        };
      }
    }
    static parseListField(eA: any): any {
      return eA
        ? Array.isArray(eA)
          ? eA.map((eA: any) => eA.trim()).filter((eA: any) => eA)
          : "string" == typeof eA && eA.trim()
            ? MarkdownUtils.splitByCommaRespectingBraces(eA)
            : []
        : [];
    }
    static splitByCommaRespectingBraces(eA: any): any {
      let el: any = [],
        ec: any = "",
        eu: any = 0;
      for (let ed of eA)
        if ("{" === ed) (eu++, (ec += ed));
        else if ("}" === ed) ((eu = Math.max(0, eu - 1)), (ec += ed));
        else if ("," === ed && 0 === eu) {
          let eA: any = ec.trim();
          (eA && el.push(eA), (ec = ""));
        } else ec += ed;
      let ed: any = ec.trim();
      return (ed && el.push(ed), el);
    }
  }
  return MarkdownUtils;
}

// Original small frontmatter parser; deliberately not YAML.
export class MemoryMarkdownUtils {
  static extractFrontMatterWithContent(eA: any): any {
    let el: any = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/,
      ec: any = eA.match(el);
    if (!ec) return { data: {}, content: eA };
    let eu: any = ec[1],
      ed: any = ec[2] || "",
      ep: any = {},
      eg: any = eu.split("\n"),
      eh: any = null,
      ef: any = [],
      em: any = [],
      eE: any = !1,
      eC: any = !1,
      ey: any = 0;
    for (let eA: any = 0; eA < eg.length; eA++) {
      let el: any = eg[eA],
        ec: any = el.trim();
      if (eE && eh) {
        let eA: any = el.match(/^(\s*)/)?.[1].length || 0;
        if (-1 !== el.indexOf(":") && eA <= ey && !el.trim().startsWith("-")) {
          let eA: any = eC ? " " : "\n";
          ((ep[eh] = em.join(eA)), (em = []), (eE = !1));
        } else if (ec) {
          em.push(eC ? ec : el);
          continue;
        } else {
          em.push("");
          continue;
        }
      }
      if (!ec || ec.startsWith("#")) continue;
      if (ec.startsWith("-")) {
        if (eh) {
          let eA: any = ec
            .substring(1)
            .trim()
            .replace(/^['"](.*)['"]$/, "$1");
          ef.push(eA);
        }
        continue;
      }
      let eu: any = el.indexOf(":");
      if (-1 === eu) continue;
      eh && ef.length > 0 && ((ep[eh] = ef), (ef = []));
      let ed: any = el.slice(0, eu).trim(),
        ew: any = el.slice(eu + 1).trim();
      "|" === ew ||
      "|-" === ew ||
      "|+" === ew ||
      ">" === ew ||
      ">-" === ew ||
      ">+" === ew
        ? ((eh = ed),
          (eE = !0),
          (eC = ew.startsWith(">")),
          (em = []),
          (ey = el.match(/^(\s*)/)?.[1].length || 0))
        : "" === ew
          ? ((eh = ed), (ef = []))
          : ("true" === ew || "false" === ew
              ? (ep[ed] = "true" === ew)
              : isNaN(Number(ew)) || "" === ew
                ? (ep[ed] = ew.replace(/^['"](.*)['"]$/, "$1"))
                : (ep[ed] = Number(ew)),
            (eh = null));
    }
    if ((eh && ef.length > 0 && (ep[eh] = ef), eh && eE && em.length > 0)) {
      let eA: any = eC ? " " : "\n";
      ep[eh] = em.join(eA);
    }
    return { data: ep, content: ed.trim() };
  }
  static parseListField(eA: any): any {
    return eA
      ? Array.isArray(eA)
        ? eA.map((eA: any) => eA.trim()).filter((eA: any) => eA)
        : "string" == typeof eA && eA.trim()
          ? MemoryMarkdownUtils.splitByCommaRespectingBraces(eA)
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

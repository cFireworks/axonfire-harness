// Native PermissionUtils subset used by AgentManager. Debug service is explicit/offline.
export class NativeAgentPermissionUtils {
  static getDebugService: () => any = () => undefined;
  static matchPermissionRules(eA: any, el: any): any {
    let ec: any = this.getDebugService();
    ec?.debug(
      `permission-utils: matchPermissionRules called, permissions: ${JSON.stringify(eA)}, toolNames: ${JSON.stringify(el)}`,
    );
    let eu: any = [];
    if (!eA || 0 === eA.length) return eu;
    let ed: any = el.map((eA: any) => eA.toLowerCase());
    for (let el of eA) {
      let eA: any = el,
        ep: any = "*",
        eg: any = el.indexOf("(");
      (eg >= 0 &&
        ((eA = el.substring(0, eg)),
        (ep = el.substring(eg + 1, el.lastIndexOf(")")))),
        ed.includes(eA.toLowerCase()) &&
          (eu.push({ permission: el, rule: ep }),
          ec?.debug(
            `permission-utils: matchPermissionRules matched - permission: "${el}", tool: "${eA}", rule: "${ep}"`,
          )));
    }
    return (
      ec?.debug(
        `permission-utils: matchPermissionRules result: ${JSON.stringify(eu)}`,
      ),
      eu
    );
  }
  static extractWholeToolRules(eA: any): any {
    return eA && 0 !== eA.length
      ? eA
          .map((eA: any) => eA?.trim())
          .filter((eA: any) => !!eA)
          .filter((eA: any) => !eA.toLowerCase().startsWith("mcp__"))
          .filter((eA: any) => !this.isScopedPermission(eA))
          .map((eA: any) => eA.toLowerCase())
      : [];
  }
  static isScopedPermission(eA: any): any {
    let el: any = eA.indexOf("("),
      ec: any = eA.lastIndexOf(")");
    return el >= 0 && ec > el;
  }
}

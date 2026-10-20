// Complete original class, codebuddy.js UTF-16 9288945..9289339.
export class McpSubagentToolManager {
  declare allowedToolsMap: Map<string, string[]>;
  constructor() {
    this.allowedToolsMap = new Map();
  }
  register(eA: string, el: string[]) {
    el.length > 0 && this.allowedToolsMap.set(eA, el);
  }
  getTools(eA: string) {
    return this.allowedToolsMap.get(eA);
  }
  isToolAllowed(eA: string, el: string) {
    let ec = this.allowedToolsMap.get(eA);
    return (
      !!(
        !ec ||
        (el.startsWith("mcp__") && !ec.some((eA) => eA.startsWith("mcp__")))
      ) || ec!.includes(el)
    );
  }
  unregister(eA: string) {
    this.allowedToolsMap.delete(eA);
  }
  clear() {
    this.allowedToolsMap.clear();
  }
}

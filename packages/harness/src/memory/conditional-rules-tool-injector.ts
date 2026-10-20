import { ToolNames } from "../tools/tool-names.js";
import { ToolResult } from "../tools/tool-result.js";
const nC = { ToolNames, ToolResult };
export function createConditionalRulesToolInjector(
  conditionalRulesService: any,
  PathUtils: any,
  logger: any,
) {
  const nW = { PathUtils };
  class ConditionalRulesToolInjector {
    conditionalRulesService = conditionalRulesService;
    logger = logger;
    async injectConditionalRules(
      eA: any,
      el: any,
      ec: any,
      eu: any,
    ): Promise<any> {
      let ed: any = ec.conditionalRules;
      if (
        !ed ||
        ![
          nC.ToolNames.READ,
          nC.ToolNames.WRITE,
          nC.ToolNames.EDIT,
          nC.ToolNames.MULTI_EDIT,
        ].includes(eA)
      )
        return;
      let ep: any = el?.file_path;
      ep && ed.pendingTriggers.add(nW.PathUtils.resolveFilePathToWorkDir(ep));
      try {
        let eA: any = await this.conditionalRulesService.consume(ed);
        eA.content &&
          nC.ToolResult.is(eu) &&
          ("string" == typeof eu.content
            ? (eu.content += `

${eA.content}`)
            : (eu.content =
                String(eu.content || "") +
                `

${eA.content}`));
      } catch (eA: any) {
        this.logger.warn(`Failed to inject conditional rules: ${eA}`);
      }
    }
  }
  return new ConditionalRulesToolInjector();
}

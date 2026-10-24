// Complete original Auto support classes; dependency construction only.
// Fixed sample SHA-256: 4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd.
// UTF-16: settings 11532061..11533443, prompt 11534729..11535845,
// project instructions 11557422..11557931, transcript limit 11561346..11561898.
import { TokenUtils } from '../context/token-utils.js';
import { MemoryScope } from '../memory/memory-rule-constants.js';
import { SettingsScope } from './native-permission-policy.js';
import { AUTO_MODE_DEFAULTS } from './auto-mode-defaults.js';
export { AUTO_MODE_DEFAULTS } from './auto-mode-defaults.js';
export function createNativeAutoModeSettingsResolver(options: any) {
  const eh: any = { SettingsScope }, ef: any = { AUTO_MODE_DEFAULTS };
  const em: any = '$defaults', eE: any = [eh.SettingsScope.USER, eh.SettingsScope.PROJECT_LOCAL, eh.SettingsScope.CLI];
  const Original = class {
    [key: string]: any;
    async resolve() {
      let eA: any = await this.mergeAllowedSources();
      return { environment: this.expandSection("environment", eA.environment, ef.AUTO_MODE_DEFAULTS.environment, !1), allow: this.expandSection("allow", eA.allow, ef.AUTO_MODE_DEFAULTS.allow, !1), soft_deny: this.expandSection("soft_deny", eA.soft_deny, ef.AUTO_MODE_DEFAULTS.soft_deny, !0), hard_deny: this.expandSection("hard_deny", eA.hard_deny, ef.AUTO_MODE_DEFAULTS.hard_deny, !0) };
    }
    async resolveRaw() {
      return this.mergeAllowedSources();
    }
    async mergeAllowedSources() {
      let eA: any = { environment: [], allow: [], soft_deny: [], hard_deny: [] }, el: any = { environment: !1, allow: !1, soft_deny: !1, hard_deny: !1 };
      for (let ec of eE) {
        let eu: any;
        try {
          eu = await this.settingsManager.get("autoMode", ec);
        }
        catch {
          continue;
        }
        if (eu)
          for (let ec of ["environment", "allow", "soft_deny", "hard_deny"]) {
            let ed: any = eu[ec];
            Array.isArray(ed) && (eA[ec].push(...ed), el[ec] = !0);
          }
      }
      return { environment: el.environment ? eA.environment : void 0, allow: el.allow ? eA.allow : void 0, soft_deny: el.soft_deny ? eA.soft_deny : void 0, hard_deny: el.hard_deny ? eA.hard_deny : void 0 };
    }
    expandSection(eA: any, el: any, ec: any, eu: any) {
      if (!el || 0 === el.length)
        return [...ec];
      if (el.includes(em)) {
        let eA: any = [], eu: any = !1;
        for (let ed of el) {
          if (ed === em) {
            eu || (eA.push(...ec), eu = !0);
            continue;
          }
          eA.push(ed);
        }
        return eA;
      }
      return eu && this.logger.warn?.(`[auto-mode] settings autoMode.${eA} replaces built-in defaults (no "${em}" present); built-in safety rules for this section are dropped`), [...el];
    }
  };
  return Object.assign(new Original(), options, { logger: options.logger ?? {} });
}
export function createNativeAutoModeSystemPromptBuilder(options: any) {
  const eh: any = 'auto-mode-classifier-instructions', ef: any = 'user_environment_to_replace', em: any = 'user_allow_rules_to_replace', eE: any = 'user_soft_deny_rules_to_replace', eC: any = 'user_hard_deny_rules_to_replace';
  const Original = class {
    [key: string]: any;
    async build(eA: any, el: any) {
      let ec: any = await this.promptManager.get(eh), eu: any = ec?.template ?? "";
      return eu = this.replaceTag(eu, ef, eA.environment), eu = this.replaceTag(eu, em, eA.allow), eu = this.replaceTag(eu, eE, eA.soft_deny), eu = (eu = this.replaceTag(eu, eC, eA.hard_deny)).replace("<settings_deny_rules>", () => this.renderSettingsDenyRules(el));
    }
    replaceTag(eA: any, el: any, ec: any) {
      let eu: any = RegExp(`<${el}>[\\s\\S]*?</${el}>`), ed: any = ec.map((eA: any) => `- ${eA}`).join("\n");
      return eA.replace(eu, () => ed);
    }
    renderSettingsDenyRules(eA: any) {
      if (!eA || 0 === eA.length)
        return "";
      let el: any = eA.map((eA: any) => `\`${eA}\``).join(", ");
      return `- User Deny Rules: The user has configured these permission deny rules: ${el}. Each rule names a tool and (optionally) an argument pattern that is already hard-blocked for that tool. Block the action if it accomplishes the same effect via a different tool — e.g. using Bash with \`python -c\`, \`sed -i\`, \`cat >\`, heredocs, or similar to write or edit a file that an Edit/Write/MultiEdit deny rule covers, or otherwise routing around a deny rule by switching tools. The named tool itself is enforced separately; your job here is to catch circumvention.`;
    }
  };
  return Object.assign(new Original(), options);
}
export function createNativeAutoModeProjectInstructionsResolver(options: any = {}) {
  const nj: any = { MemoryScope }, nH: any = 20000;
  const Original = class {
    [key: string]: any;
    async resolve() {
      if (!this.memoryManager)
        return "";
      try {
        let [eA, el]: any = await Promise.all([this.memoryManager.get({ scope: nj.MemoryScope.USER }), this.memoryManager.get({ scope: nj.MemoryScope.PROJECT })]), ec: any = [...eA, ...el].map((eA: any) => eA?.content?.trim()).filter((eA: any) => !!eA);
        if (0 === ec.length)
          return "";
        let eu: any = ec.join("\n\n");
        return eu.length > nH ? `${eu.slice(0, nH)}
... (truncated)` : eu;
      }
      catch (eA: any) {
        return this.logger.warn?.(`[auto-mode] failed to resolve project instructions: ${eA instanceof Error ? eA.message : String(eA)}`), "";
      }
    }
  };
  return Object.assign(new Original(), options, { logger: options.logger ?? {} });
}
export function createNativeAutoModeTranscriptLimit(options: any) {
  const nW: any = { TokenUtils }, nz: any = { AgentNames: { AUTO_MODE_CLASSIFIER: 'autoModeClassifier' } }, nZ: any = 8000, nX: any = 8192, n0: any = 128000;
  const Original = class {
    [key: string]: any;
    async check(eA: any) {
      let el: any = nW.TokenUtils.estimateTokensRough(eA), ec: any = await this.resolveLimit();
      return { tooLong: el > ec, actualTokens: el, limitTokens: ec };
    }
    async resolveLimit() {
      let eA: any = n0;
      try {
        let el: any = (await this.agentManager.getModel(nz.AgentNames.AUTO_MODE_CLASSIFIER)).id, ec: any = await this.productManager.waitConfiguration(), eu: any = ec.models?.find((eA: any) => eA.id === el)?.maxInputTokens;
        eu && eu > 0 && (eA = eu);
      }
      catch (eA: any) {
        this.logger.warn?.(`[auto-mode] could not resolve classifier model context window: ${eA instanceof Error ? eA.message : String(eA)}`);
      }
      return Math.max(eA - nZ - nX, 1);
    }
  };
  return Object.assign(new Original(), options, { logger: options.logger ?? {} });
}

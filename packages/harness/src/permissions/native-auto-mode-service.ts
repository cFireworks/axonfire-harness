import { PermissionMode } from './permission.js';
import { SettingsScope } from './native-permission-policy.js';
// Complete original classes; construction injection only. Fixed sample SHA-256
// 4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd.
const ih: any = { PermissionMode, SettingsScope };
const nM: any = 3, nx: any = 3, nO: any = 20, nN: any = 20;
export const ClassifierUnavailableError = class ClassifierUnavailableError extends Error {
  [key: string]: any;
  constructor(eA: any, el: any) {
    super(eA), this.cause = el, this.name = "ClassifierUnavailableError";
  }
};
export const ClassifierStage2Error = class ClassifierStage2Error extends Error {
  [key: string]: any;
  constructor(eA: any, el: any) {
    super(eA), this.cause = el, this.name = "ClassifierStage2Error";
  }
};
export const TranscriptTooLongError = class TranscriptTooLongError extends Error {
  [key: string]: any;
  constructor(eA: any, el: any) {
    super(`Classifier transcript exceeded context window (${eA} > ${el} tokens)`), this.actualTokens = eA, this.limitTokens = el, this.name = "TranscriptTooLongError";
  }
};
// Original UTF-16 11555146..11556741.
export const AutoModeDenialTracker = class {
  [key: string]: any;
  constructor() {
    this.entries = new Map;
  }
  entry(eA: any) {
    let el: any = this.entries.get(eA);
    return el || (el = { recentDenials: [], consecutiveDenials: 0, totalDenials: 0, consecutiveFailures: 0 }, this.entries.set(eA, el)), el;
  }
  recordDenial(eA: any, el: any) {
    let ec: any = this.entry(eA), eu: any = ec.recentDenials.findIndex((eA: any) => eA.toolName === el.toolName && eA.inputKey === el.inputKey);
    eu >= 0 && ec.recentDenials.splice(eu, 1), ec.recentDenials.push(el), ec.recentDenials.length > nN && ec.recentDenials.splice(0, ec.recentDenials.length - nN);
  }
  findDenial(eA: any, el: any, ec: any) {
    return this.entries.get(eA)?.recentDenials.find((eA: any) => eA.toolName === el && eA.inputKey === ec);
  }
  removeDenial(eA: any, el: any, ec: any) {
    let eu: any = this.entries.get(eA);
    if (!eu)
      return !1;
    let ed: any = eu.recentDenials.findIndex((eA: any) => eA.toolName === el && eA.inputKey === ec);
    return !(ed < 0) && (eu.recentDenials.splice(ed, 1), !0);
  }
  getRecentDenials(eA: any) {
    return [...this.entries.get(eA)?.recentDenials ?? []];
  }
  recordClassifierBlock(eA: any) {
    let el: any = this.entry(eA);
    el.consecutiveDenials += 1, el.totalDenials += 1;
    let ec: any = el.consecutiveDenials >= nx, eu: any = el.totalDenials >= nO, ed: any = { consecutiveDenials: el.consecutiveDenials, totalDenials: el.totalDenials, exceeded: ec || eu, kind: eu ? "total" : ec ? "consecutive" : void 0 };
    return ed.exceeded && (el.consecutiveDenials = 0, el.totalDenials = 0), ed;
  }
  resetConsecutiveDenials(eA: any) {
    let el: any = this.entries.get(eA);
    el && (el.consecutiveDenials = 0);
  }
  recordClassifierFailure(eA: any) {
    let el: any = this.entry(eA);
    return el.consecutiveFailures += 1, el.consecutiveFailures >= nM;
  }
  recordClassifierSuccess(eA: any) {
    let el: any = this.entries.get(eA);
    el && (el.consecutiveFailures = 0);
  }
  isCircuitOpen(eA: any) {
    let el: any = this.entries.get(eA);
    return !!el && el.consecutiveFailures >= nM;
  }
  clear(eA: any) {
    this.entries.delete(eA);
  }
};
// Original UTF-16 11570431..11574048.
const NativeAutoModePermissionService = class {
  [key: string]: any;
  async isAutoModeAvailable() {
    try {
      let eA: any = await this.settingsManager.get("permissions");
      if (eA?.disableAutoMode === "disable")
        return { available: !1, reason: "disabledBySettings", message: "auto mode disabled by settings" };
    }
    catch {
    }
    return { available: !0 };
  }
  async isSettingsAutoGrantAllowed() {
    for (let eA of [ih.SettingsScope.USER, ih.SettingsScope.CLI])
      try {
        let el: any = await this.settingsManager.get("permissions", eA);
        if (el?.defaultMode === ih.PermissionMode.Auto)
          return !0;
      }
      catch {
      }
    return !1;
  }
  async classifyAsk(eA: any) {
    let el: any;
    if (this.denialTracker.isCircuitOpen(eA.sessionId))
      return this.logger.warn?.("[auto-mode] circuit breaker open — leaving auto mode, falling back"), this.fallback(eA, "auto mode classifier circuit breaker open", !0);
    let ec: any = await this.rulesResolver.resolve(), eu: any = await this.projectInstructionsResolver.resolve();
    try {
      el = await this.classifier.classify({ toolName: eA.toolName, toolInput: eA.toolInput, rules: ec, transcript: eA.transcript, settingsDenyRules: eA.settingsDenyRules, projectInstructions: eu, sessionId: eA.sessionId });
    }
    catch (eu: any) {
      if (eu instanceof TranscriptTooLongError)
        return this.logger.warn?.(`[auto-mode] ${eu.message} — ${eA.headless ? "aborting (headless)" : "falling back to normal permission handling"}`), { behavior: "transcriptTooLong", reason: eu.message, headlessAbort: !!eA.headless, actualTokens: eu.actualTokens, limitTokens: eu.limitTokens };
      let el: any = this.denialTracker.recordClassifierFailure(eA.sessionId), ec: any = eu instanceof Error ? eu.message : String(eu);
      if (eu instanceof ClassifierStage2Error)
        return this.logger.warn?.(`[auto-mode] stage 2 classifier error — blocking based on stage 1 assessment: ${ec}${el ? " (circuit breaker opened — leaving auto mode)" : ""}`), this.failClosed("Stage 2 classifier error - blocking based on stage 1 assessment (usually transient — retrying often succeeds)", el);
      return this.logger.warn?.(`[auto-mode] classifier unavailable — blocking for safety: ${ec}${el ? " (circuit breaker opened — leaving auto mode)" : ""}`), this.failClosed("Classifier unavailable - blocking for safety", el);
    }
    if (this.denialTracker.recordClassifierSuccess(eA.sessionId), "allow" === el.decision)
      return this.denialTracker.resetConsecutiveDenials(eA.sessionId), el.inputKey && this.denialTracker.removeDenial(eA.sessionId, eA.toolName, el.inputKey) && this.logger.debug?.(`[auto-mode] subsequent approval of previously-blocked ${eA.toolName} action`), { behavior: "allow", reason: el.reason || "allowed by auto mode classifier", source: "classifier" };
    let ed: any = this.buildDisplay(eA.toolName, el.inputKey);
    this.denialTracker.recordDenial(eA.sessionId, { toolName: eA.toolName, display: ed, inputKey: el.inputKey, reason: el.reason || "blocked by auto mode classifier", timestamp: Date.now() });
    let ep: any = this.denialTracker.recordClassifierBlock(eA.sessionId);
    if (ep.exceeded) {
      let ec: any = "total" === ep.kind ? `${nO} actions were blocked by the auto mode classifier this session. Latest blocked action: ${ed} — ${el.reason}` : `${nx} consecutive actions were blocked by the auto mode classifier. Latest blocked action: ${ed} — ${el.reason}`;
      return this.logger.warn?.(`[auto-mode] denial limit exceeded (${ep.kind}) — ${eA.headless ? "aborting (headless)" : "pausing auto / falling back to prompt"}`), { behavior: "denialLimitExceeded", reason: ec, headlessAbort: !!eA.headless };
    }
    return { behavior: "deny", reason: el.reason || "blocked by auto mode classifier", category: "unknown" };
  }
  buildDisplay(eA: any, el: any) {
    if (!el)
      return eA;
    let ec: any = el.replace(/\s+/g, " ").trim(), eu: any = ec.length > 80 ? `${ec.slice(0, 80)}…` : ec;
    return `${eA} ${eu}`;
  }
  fallback(eA: any, el: any, ec: any = !1) {
    return { behavior: "unavailable", reason: el, failClosed: !eA.canPrompt, kickOutOfAuto: ec };
  }
  failClosed(eA: any, el: any) {
    return { behavior: "unavailable", reason: eA, failClosed: !0, kickOutOfAuto: el };
  }
};
export type AutoModeHostOptions = {
  classifier: {
    classify(input: any): Promise<any>;
  };
  rulesResolver: {
    resolve(): Promise<any>;
  };
  projectInstructionsResolver: {
    resolve(): Promise<string>;
  };
  denialTracker?: InstanceType<typeof AutoModeDenialTracker>;
};
/** Explicit owned dependencies: does not silently select a model or load installed settings. */
export function createNativeAutoModePermissionService(options: AutoModeHostOptions & {
  settingsManager: any;
  logger?: any;
}) {
  return Object.assign(new NativeAutoModePermissionService(), {
    ...options,
    denialTracker: options.denialTracker ?? new AutoModeDenialTracker(),
    logger: options.logger ?? {},
  });
}

export enum PermissionMode {
  Default = "default",
  AcceptEdits = "acceptEdits",
  Plan = "plan",
  Auto = "auto",
  DontAsk = "dontAsk",
  BypassPermissions = "bypassPermissions",
  FullAccess = "fullAccess",
  Ignore = "ignore",
  Work = "work",
  Delegate = "delegate",
}

/** Exact WorkBuddy rule: only non-interactive classifier modes form a ceiling. */
export function permissionCeilingForParent(
  parent: PermissionMode,
): PermissionMode | undefined {
  if (
    parent === PermissionMode.Auto ||
    parent === PermissionMode.DontAsk
  ) {
    return parent;
  }
  return undefined;
}

export function inheritedSubagentPermissionMode(
  parent: PermissionMode,
): PermissionMode {
  return parent === PermissionMode.Delegate ? PermissionMode.Default : parent;
}

export function isRestrictedDirectApproveMode(mode: PermissionMode): boolean {
  return mode === PermissionMode.Auto || mode === PermissionMode.DontAsk;
}

export function clampPermissionToParent(
  parent: PermissionMode,
  requested: PermissionMode,
): PermissionMode {
  return (
    permissionCeilingForParent(parent) ??
    (requested === PermissionMode.Ignore
      ? inheritedSubagentPermissionMode(parent)
      : requested)
  );
}

export function parsePermissionMode(
  value: string | undefined,
): PermissionMode | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[\s_-]/g, "").toLowerCase();
  return Object.values(PermissionMode).find(
    (mode) => mode.replace(/[\s_-]/g, "").toLowerCase() === normalized,
  );
}

export function matchPermissionRule(rule: string, candidate: string): boolean {
  const expression = rule
    .trim()
    .toLowerCase()
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${expression}$`, "i").test(candidate);
}

export function extractWholeToolRules(rules: readonly string[] = []): string[] {
  return rules
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0 && !rule.includes("("))
    .map((rule) => rule.toLowerCase());
}

export function buildDontAskDenyMessage(
  toolName: string,
  reason?: string,
): string {
  const detail = reason?.trim()
    ? ` ${reason.trim().replace(/\.$/, "")}.`
    : "";
  return `Permission to use ${toolName} has been denied because CodeBuddy is running in dontAsk mode.${detail} IMPORTANT: You *may* attempt to accomplish this action using other tools that might naturally be used to accomplish this goal, e.g. using head instead of cat. But you *should not* attempt to work around this denial in malicious ways, e.g. do not use your ability to run tests to execute non-test actions. You should only try to work around this restriction in reasonable ways that do not attempt to bypass the intent behind this denial. If you believe this capability is essential to complete the user's request, STOP and explain to the user what you were trying to do and why you need this permission. Let the user decide how to proceed. To allow this type of action in the future, the user can add a permission rule to their settings.`;
}

export function buildClassifierUnavailableDenyMessage(
  toolName: string,
  reason?: string,
): string {
  const detail = reason?.trim() ? ` (${reason.trim()})` : "";
  return `The auto mode safety classifier is temporarily unavailable${detail}, so auto mode cannot determine the safety of ${toolName} right now. Wait briefly and then try this action again. If it keeps failing, continue with other tasks that don't require this action and come back to it later. Note: reading files, searching code, and other read-only operations do not require the classifier and can still be used.`;
}

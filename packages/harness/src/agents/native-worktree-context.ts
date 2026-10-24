// @ts-nocheck
// Full original Worktree interceptor declaration; no decorators or product bootstrap.
export const WORKTREE_CONTEXT_DECLARATION = [13442379, 13443445] as const;
export function createNativeWorktreeContext(runtime: any) {
  const eg = runtime.getModule(69466),
    eh = runtime.getModule(93039);
  let em = "git worktree",
    eE = `<system-reminder data-role="worktree">
This is a git worktree — an isolated copy of the repository.
Run all commands from this directory. Do NOT \`cd\` to the original repository root.
</system-reminder>`,
    eC = class {
      constructor() {
        this.priority = eg.AgentRunInterceptorPriority.WorktreeContext;
      }
      async intercept(eA) {
        !Array.isArray(eA.input) ||
          eA.skipRun ||
          !this.worktreeSessionManager?.isInWorktreeSession() ||
          (this.shouldInjectWorktreePrompt(eA) &&
            (eh.MessageUtils.addSystemReminder(eA.input, eE, "last"),
            this.logger.setContext("WorktreeContextInterceptor"),
            this.logger.debug("Injected worktree context prompt")));
      }
      shouldInjectWorktreePrompt(eA) {
        let el = eA.input,
          ec = 1 === el.filter((eA) => "user" === eA.role).length,
          eu = !!(
            eA.session.options?.continue && !eA.session.options?.continued
          );
        if (ec || eu) return !0;
        for (let eA of el)
          if ("message" === eA.type && "user" === eA.role) {
            let el = eA.content;
            if ("string" == typeof el && el.includes(em)) return !1;
            if (Array.isArray(el)) {
              for (let eA of el)
                if (
                  "input_text" === eA.type &&
                  "string" == typeof eA.text &&
                  eA.text.includes(em)
                )
                  return !1;
            }
          }
        return !0;
      }
    };
  return eC;
}

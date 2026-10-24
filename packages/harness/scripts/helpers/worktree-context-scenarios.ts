import { createNativeWorktreeContext } from "../../src/agents/native-worktree-context.js";
export async function worktreeContextScenarios(
  factory: typeof createNativeWorktreeContext,
) {
  const cases = [
    {
      name: "first user",
      input: [{ type: "message", role: "user", content: "hello" }],
    },
    {
      name: "optional manager absent",
      absent: true,
      input: [{ type: "message", role: "user", content: "hello" }],
    },
    {
      name: "not a worktree",
      active: false,
      input: [{ type: "message", role: "user", content: "hello" }],
    },
    {
      name: "skip",
      skipRun: true,
      input: [{ type: "message", role: "user", content: "hello" }],
    },
    { name: "non-array", input: "hello" },
    {
      name: "prior reminder string",
      input: [
        { type: "message", role: "user", content: "git worktree" },
        { type: "message", role: "user", content: "again" },
      ],
    },
    {
      name: "prior reminder content",
      input: [
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "git worktree" }],
        },
        { type: "message", role: "user", content: "again" },
      ],
    },
    {
      name: "continue overrides reminder",
      options: { continue: true, continued: false },
      input: [
        { type: "message", role: "user", content: "git worktree" },
        { type: "message", role: "user", content: "again" },
      ],
    },
    { name: "options absent", input: [] },
  ];
  const results = [];
  for (const scenario of cases) {
    const value: any = scenario,
      calls: any[] = [];
    const Constructor = factory({
      getModule: (id: number) =>
        id === 69466
          ? { AgentRunInterceptorPriority: { WorktreeContext: 37 } }
          : {
              MessageUtils: {
                addSystemReminder: (
                  _input: any,
                  text: string,
                  position: string,
                ) => calls.push([text, position]),
              },
            },
    });
    const instance: any = new Constructor();
    instance.logger = {
      setContext: (x: any) => calls.push(["context", x]),
      debug: (x: any) => calls.push(["debug", x]),
    };
    if (!value.absent)
      instance.worktreeSessionManager = {
        isInWorktreeSession: () => value.active !== false,
      };
    await instance.intercept({
      input: value.input,
      skipRun: value.skipRun,
      session: { options: value.options },
    });
    results.push({ name: value.name, priority: instance.priority, calls });
  }
  return results;
}

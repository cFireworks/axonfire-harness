// Original Zod 3 hook schema expressions; fixed sample UTF-16 9580751..9581916.
import { z } from "zod3";
import { HookEvent } from "../hooks/hook-constants.js";
export function createNativePluginFrontmatter() {
  const Aq = { z },
    Az = { HookEvent };
  let AW = {
      timeout: Aq.z.number().optional(),
      pluginRoot: Aq.z.string().optional(),
      pluginData: Aq.z.string().optional(),
      pluginOptions: Aq.z
        .record(Aq.z.union([Aq.z.string(), Aq.z.boolean(), Aq.z.number()]))
        .optional(),
      if: Aq.z.string().optional(),
      statusMessage: Aq.z.string().optional(),
      once: Aq.z.boolean().optional(),
      async: Aq.z.boolean().optional(),
      asyncRewake: Aq.z.boolean().optional(),
      allowedEnvVars: Aq.z.array(Aq.z.string()).optional(),
    },
    AV = Aq.z.object({
      ...AW,
      type: Aq.z.literal("command"),
      command: Aq.z.string(),
      shell: Aq.z.enum(["bash", "powershell"]).optional(),
    }),
    AZ = Aq.z.object({
      ...AW,
      type: Aq.z.literal("prompt"),
      prompt: Aq.z.string(),
      model: Aq.z.string().optional(),
      continueOnBlock: Aq.z.boolean().optional(),
    }),
    AX = Aq.z.object({
      ...AW,
      type: Aq.z.literal("agent"),
      prompt: Aq.z.string(),
      agentType: Aq.z.string().optional(),
      model: Aq.z.string().optional(),
    }),
    A0 = Aq.z.object({
      ...AW,
      type: Aq.z.literal("http"),
      url: Aq.z.string(),
      headers: Aq.z.record(Aq.z.string()).optional(),
      method: Aq.z.enum(["POST", "PUT", "PATCH"]).optional(),
    }),
    A1 = Aq.z.discriminatedUnion("type", [AV, AZ, AX, A0]),
    A2 = Aq.z.object({
      matcher: Aq.z.string().optional(),
      hooks: Aq.z.array(A1),
    }),
    A3 = new Set(Object.values(Az.HookEvent));
  return { A2, A3 };
}

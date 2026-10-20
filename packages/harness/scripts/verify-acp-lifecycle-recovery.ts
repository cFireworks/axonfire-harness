import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { loadCapturedAcpLifecycle } from "./helpers/captured-acp-lifecycle.js";
import { ACP_LIFECYCLE_CASES } from "./helpers/acp-lifecycle-scenarios.js";
import { createNativeAcpLifecycle } from "../src/protocol/native-acp-lifecycle.js";
import { loadCapturedAcpProtocol } from "./helpers/captured-acp-protocol.js";
import { loadCapturedAcpSdk } from "./helpers/captured-acp-sdk.js";
import { loadCapturedAcpServices } from "./helpers/captured-acp-services.js";
import { acpViewFixture } from "./helpers/acp-view-fixture.js";
import { readFile, access } from "node:fs/promises";
const cli = readFileSync(getCapturedBundlePath(), "utf8"),
  original = loadCapturedAcpLifecycle(cli);
for (const scenario of ACP_LIFECYCLE_CASES)
  assert.deepEqual(
    await scenario.run(createNativeAcpLifecycle),
    await scenario.run(original.factory),
    scenario.name,
  );
const protocol = loadCapturedAcpProtocol(cli),
  sdk = loadCapturedAcpSdk(cli),
  services = loadCapturedAcpServices(cli);
async function integration(
  reference: boolean,
  decision: string,
  deferred: boolean,
  extra: any = {},
) {
  const cleanup: Array<() => Promise<any>> = [];
  try {
    const p = await acpViewFixture(
      { after: (action: () => Promise<any>) => cleanup.push(action) },
      {
        deferred,
        ...extra,
        requestPermission: async () => ({
          outcome: { outcome: "selected", optionId: decision },
        }),
        ...(reference
          ? {
              protocolFactories: protocol,
              sdkFactory: sdk.factory,
              lifecycleFactory: original.factory,
              servicesFactory: services.factory,
            }
          : {}),
      },
    );
    await p.client.initialize({ protocolVersion: 1 });
    if (extra.denyRule)
      await p.backend.permissions.service.applyUpdate(p.session, {
        type: "addRules",
        rules: [{ toolName: "Write" }],
        behavior: "deny",
        destination: "session",
      });
    const response = await p.client.prompt({
      sessionId: p.session.id,
      prompt: [{ type: "text", text: "owned integration write" }],
    });
    let file: string | null;
    try {
      file = await readFile(p.path, "utf8");
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
      file = null;
    }
    if (extra.toolName === "Read") assert.equal(file, "owned readable content");
    else if (decision !== "reject" && !extra.denyRule)
      assert.equal(file, "written through ACP");
    else await assert.rejects(access(p.path), { code: "ENOENT" });
    assert.equal(p.localApprovals.length, 0);
    assert.equal(
      p.permissions.length,
      extra.toolName === "Read" || extra.denyRule ? 0 : 1,
    );
    await p.host.close();
    return {
      stopReason: response.stopReason,
      outcome: response._meta?.["codebuddy.ai/outcome"],
      permissions: p.permissions.map((request: any) => ({
        options: request.options,
        toolName: request.toolCall._meta["codebuddy.ai/toolName"],
        rawInput: JSON.parse(
          JSON.stringify(request.toolCall.rawInput).split(p.path).join("OWNED"),
        ),
      })),
      toolStates: p.updates
        .filter((value: any) =>
          ["tool_call", "tool_call_update"].includes(
            value.update.sessionUpdate,
          ),
        )
        .map((value: any) => [
          value.update.sessionUpdate,
          value.update.status,
          value.update.kind,
        ]),
      file,
      timers: p.host.timerCount,
      listeners: p.host.taskListenerCount,
      owners: p.backend.approvalOwners.count,
    };
  } finally {
    for (const action of cleanup) await action();
  }
}
for (const [decision, deferred, extra] of [
  ["allow", false, {}],
  ["reject", false, {}],
  ["allow", true, {}],
  ["allow", false, { toolName: "Read" }],
  ["allow_always", false, { repeatWrite: true }],
  ["allow", false, { denyRule: true }],
] as const)
  assert.deepEqual(
    await integration(false, decision, deferred, extra),
    await integration(true, decision, deferred, extra),
    "full original Agent/View/SDK integration " +
      decision +
      "/" +
      deferred +
      JSON.stringify(extra),
  );
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: ACP_LIFECYCLE_CASES.length,
    fullOriginalSdkIntegrationPairs: 6,
    bootstrapExecuted: false,
    ok: true,
  }),
);

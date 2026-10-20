import * as sdk from "@openai/agents-core";
import { acpProtocolFixture } from "./acp-protocol-fixture.js";
import { createNativeAcpServices } from "../../src/protocol/native-acp-services.js";
import { createNativeProductEnvironment } from "../../src/config/native-product-environment.js";
import { COMMAND_XML_TAGS } from "../../src/commands/command-message-utils.js";
import { getActiveAgentOnlyHistory } from "../../src/sessions/history-utils.js";
export function acpServicesFixture(
  factory = createNativeAcpServices,
  patch: any = {},
) {
  const h = acpProtocolFixture(),
    calls: any[] = [],
    reports: any[] = [],
    connections = new Map<string, any>();
  const configuration: any = {
    endpoint: "https://owned.invalid",
    productFeatures: {},
  };
  const utilities: any = {
    ...h.modules[93039],
    HistoryUtils: { getActiveAgentOnlyHistory },
  };
  const modules = {
    ...h.modules,
    93039: utilities,
    18553: sdk,
    21580: { HistoryUtils: { getActiveAgentOnlyHistory } },
    51147: { BooleanUtils: createNativeProductEnvironment({}).BooleanUtils },
    76884: { CommandXmlTags: COMMAND_XML_TAGS },
    6350: { TOOL_NO_CONTENT: "(No content)" },
    ...patch.modules,
  };
  const n: any = factory({
    ...h.runtime,
    modules,
    env: patch.env ?? {},
    tty: patch.tty ?? false,
  });
  utilities.UsageUtils = n.UsageUtils;
  const title: any = new n.SessionTitleServiceImpl(),
    recall: any = new n.FrictionRecallClientImpl(),
    friction: any = new n.FrictionAnalysisServiceImpl(),
    broadcast: any = new n.AcpBroadcastServiceImpl(),
    usage: any = new n.AcpUsagePublisherImpl();
  const productManager = { waitConfiguration: async () => configuration };
  Object.assign(title, {
    logger: h.logger,
    agentService: {
      runOneTime: async (...args: any[]) => {
        calls.push(["title", ...args]);
        return (await patch.generate?.(...args)) ?? '{"title":"Owned title"}';
      },
    },
    sessionManager: {
      addHistory: async (session: any, items: any[]) => {
        calls.push(["history", items]);
        session.history.push(...items);
      },
    },
    terminalTitleUpdater: {
      update: (title: string) => calls.push(["terminal", title]),
    },
  });
  Object.assign(recall, {
    logger: h.logger,
    productManager,
    restOperations: {
      request: async (request: any) => {
        calls.push(["recall", request]);
        return (await patch.request?.(request)) ?? { data: { results: [] } };
      },
    },
  });
  Object.assign(friction, {
    logger: h.logger,
    productManager,
    frictionRecallClient: recall,
    eventService: {
      report: async (...args: any[]) => {
        reports.push(args);
        await patch.report?.(...args);
      },
    },
  });
  Object.assign(broadcast, {
    logger: h.logger,
    stateMachine: h.stateMachine,
    agentManager: { getAll: () => connections },
  });
  Object.assign(usage, {
    logger: h.logger,
    agentManager: {
      getDefault: async () => ({
        name: "craft",
        instructions: "system instructions",
        tools: [],
      }),
      getModels: async () => [{ id: "fixture-model", maxInputTokens: 1000 }],
      getModel: async () => ({ maxInputTokens: 1000 }),
    },
  });
  return {
    h,
    n,
    title,
    recall,
    friction,
    broadcast,
    usage,
    configuration,
    calls,
    reports,
    connections,
    close() {
      broadcast.dispose();
      usage.dispose();
      h.close();
    },
  };
}

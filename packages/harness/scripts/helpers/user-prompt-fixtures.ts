import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createNativeUserPrompt } from "../../src/prompts/native-user-prompt.js";
import { desktopTemplateDirectory } from "../../src/prompts/desktop-template-assets.js";

export async function userPromptFixture(
  root: string,
  factory: (runtime: any) => any = createNativeUserPrompt,
  options: any = {},
) {
  const cwd = path.join(root, "project"),
    home = path.join(root, "home"),
    configDir = path.join(home, ".workbuddy");
  await fs.promises.mkdir(cwd, { recursive: true });
  await fs.promises.mkdir(configDir, { recursive: true });
  const logs: any[] = [],
    calls: any[] = [];
  const logger = Object.fromEntries(
    ["info", "warn", "error", "debug"].map((name) => [
      name,
      (...args: any[]) => logs.push([name, ...args]),
    ]),
  );
  class FixedDate extends Date {
    constructor(...args: any[]) {
      super(args.length ? args[0] : "2026-10-20T01:02:03.000Z");
    }
  }
  const product: any = { productFeatures: {} },
    account: any = {};
  const config: any = {};
  const runtime: any = {
    getWorkDir: () => cwd,
    fs,
    os: { ...os, homedir: () => home },
    env: { SHELL: "/bin/test-shell", WORKBUDDY_CONFIG_DIR: configDir },
    platform: "fixture-platform",
    Date: FixedDate,
    Intl: {
      DateTimeFormat: class extends Intl.DateTimeFormat {
        constructor(locale: any, options: any) {
          super(locale, { ...options, timeZone: "UTC" });
        }
      },
    },
    logger,
    console: logger,
    resourcePromptNative: {
      requireWorkbuddyPromptTemplatePath: (name: string) =>
        path.join(desktopTemplateDirectory(), name),
      readAppConfigValue: (key: string) => config[key] ?? null,
      APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY: "disableLocalSkillsMemory",
    },
    common: {
      ProductFeature: {
        TencentDocsAiEdit: "TencentDocsAiEdit",
        TencentDocsAiEditEnterprise: "TencentDocsAiEditEnterprise",
      },
    },
    // Explicit deterministic external-engine doubles: prove routing inputs/gates, not original engine renderer bytes.
    tencentDocsEngine: {
      renderTencentDocsRoutingPrompt: (input: any) => {
        calls.push(["routing", input]);
        return input.remoteDocs.length ||
          input.attachedFilePaths.length ||
          input.activeDocument
          ? ["<fixture-doc-routing/>"]
          : [];
      },
      renderTencentDocsSelectionPrompt: (input: any) => {
        calls.push(["selection", input]);
        return ["<fixture-doc-selection/>"];
      },
    },
    tencentDocsDocumentService: {
      buildTurnDocumentRoutingContext: async (input: any) => {
        calls.push(["documentService", input]);
        return {
          tencentDocsRoutingFilePaths: input.routingFilePaths,
          activeLocalDocument: input.activeSelection,
          activeOnlineDocument: undefined,
        };
      },
    },
    ...options.runtime,
  };
  const native = factory(runtime);
  const service = new native.WorkbuddyUserPromptService();
  Object.assign(service, {
    logger,
    systemPromptService: {
      renderUserContext: async (input: any) => {
        calls.push(["identity", input]);
        return "<fixture-identity/>";
      },
    },
    productManager: { getCurrentConfiguration: () => product },
    authenticationManager: {
      currentSessionSubject: { getValue: () => ({ account }) },
    },
    ...options.services,
  });
  const request = (patch: any = {}) => ({
    sessionId: "s",
    cwd,
    prompt: [{ type: "text", text: "hello" }],
    ...patch,
  });
  function snapshot(value: any): any {
    if (typeof value === "string")
      return value
        .replaceAll(root, "<ROOT>")
        .replaceAll(desktopTemplateDirectory(), "<TEMPLATES>");
    if (value instanceof Error)
      return { name: value.name, message: snapshot(value.message) };
    if (value instanceof Map) return [...value].map(snapshot);
    if (value instanceof Set) return [...value].map(snapshot);
    if (Array.isArray(value)) return value.map(snapshot);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, snapshot(v)]),
      );
    return value;
  }
  return {
    native,
    service,
    cwd,
    home,
    configDir,
    root,
    logs,
    calls,
    product,
    account,
    config,
    request,
    snapshot,
    fs,
  };
}

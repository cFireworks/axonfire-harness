import { createNativeAutoModeClassifier, type AutoModeClassifierOptions } from "./native-auto-mode-classifier.js";
import { createNativeAutoModePermissionService } from "./native-auto-mode-service.js";
import {
  createNativeAutoModeSettingsResolver,
  createNativeAutoModeSystemPromptBuilder,
  createNativeAutoModeProjectInstructionsResolver,
  createNativeAutoModeTranscriptLimit,
} from "./native-auto-mode-support.js";

export type NativeAutoModeRuntimeOptions = Pick<AutoModeClassifierOptions,
  "agentService" | "tools" | "getHomeDir" | "logger" | "env" | "fs"
> & {
  settingsManager: { get(key: string, scope?: string): Promise<any> };
  promptManager: { get(name: string): Promise<{ template?: string } | undefined> };
  agentManager: { getModel(name: string): Promise<{ id: string }> };
  productManager: { waitConfiguration(): Promise<{ models?: Array<{ id: string; maxInputTokens?: number }> }> };
  memoryManager?: { get(options: { scope: string }): Promise<Array<{ content?: string }>> };
};

/** Compose original Auto services using only explicitly supplied host dependencies. */
export function createNativeAutoModeRuntime(options: NativeAutoModeRuntimeOptions) {
  const rulesResolver = createNativeAutoModeSettingsResolver(options);
  const systemPromptBuilder = createNativeAutoModeSystemPromptBuilder(options);
  const projectInstructionsResolver = createNativeAutoModeProjectInstructionsResolver(options);
  const transcriptLimit = createNativeAutoModeTranscriptLimit(options);
  const classifier = createNativeAutoModeClassifier({ ...options, systemPromptBuilder, transcriptLimit });
  const service = createNativeAutoModePermissionService({ ...options, classifier, rulesResolver, projectInstructionsResolver });
  return { service, classifier, rulesResolver, systemPromptBuilder, projectInstructionsResolver, transcriptLimit };
}

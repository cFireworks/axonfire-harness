// @ts-nocheck
// Complete inert declarations; original DI decorators and application bootstrap are not executed.
export const ACP_SERVICES_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_SERVICE_BLOCKS = [
  {
    "key": "broadcast",
    "sourceModule": 74428,
    "exports": [],
    "classes": [["nm", 8249747, 8261750]],
    "functions": [["buildSubAgentMeta", 8249504, 8249733]],
    "constants": [["nf", 8249740, 8249743]],
    "declarations": [
      ["buildSubAgentMeta", 8249504, 8249733],
      ["nf", 8249733, 8261751],
    ],
    "bindings": [
      ["nc", 67330],
      ["nd", 30638],
      ["ne", 70724],
      ["ng", 7340],
      ["nh", 38548],
      ["np", 12502],
      ["r6", 80699],
      ["r8", 22618],
    ],
  },
  {
    "key": "usage",
    "sourceModule": 74428,
    "exports": [],
    "classes": [["iw", 8368235, 8373694]],
    "functions": [
      ["getRootRequestId", 8373695, 8373795],
      ["toFiniteNumber", 8373795, 8373882],
    ],
    "constants": [
      ["iE", 8368172, 8368175],
      ["iC", 8368179, 8368203],
      ["iy", 8368207, 8368231],
    ],
    "declarations": [
      ["iE", 8368165, 8373695],
      ["getRootRequestId", 8373695, 8373795],
      ["toFiniteNumber", 8373795, 8373882],
    ],
    "bindings": [
      ["im", 82263],
      ["nB", 93039],
      ["r8", 22618],
    ],
  },
  {
    "key": "title",
    "sourceModule": 68593,
    "exports": [
      ["SessionTitleServiceImpl", 10933511, 10933517],
      ["SessionTitleService", 10933538, 10933564],
      ["getFirstRealUserMessageText", 10933593, 10933627],
      ["hasCustomTitle", 10933643, 10933664],
      ["hasGeneratedTitle", 10933683, 10933707],
      ["getEffectiveSessionTitle", 10933733, 10933764],
      ["getFirstUsableUserMessageText", 10933795, 10933831],
    ],
    "classes": [["eT", 10934512, 10937871]],
    "functions": [],
    "constants": [
      ["eS", 10934494, 10934495],
      ["eQ", 10934499, 10934500],
      ["eD", 10934504, 10934508],
    ],
    "declarations": [["eS", 10934487, 10937872]],
    "bindings": [
      ["eB", 76884],
      ["eC", 51147],
      ["ef", 76586],
      ["em", 20881],
      ["ew", 66545],
    ],
  },
  {
    "key": "friction",
    "sourceModule": 18945,
    "exports": [
      ["CHAT_PROMPT_FRICTION_ANALYSIS_EVENT", 11391688, 11391694],
      ["FrictionAnalysisService", 11391719, 11391725],
      ["FrictionAnalysisServiceImpl", 11391754, 11391760],
      ["buildFrictionTelemetryPayload", 11391791, 11391824],
      ["extractVisibleUserPromptFromAcpPrompt", 11391863, 11391904],
      ["extractVisibleUserPromptFromAgentInput", 11391944, 11391986],
    ],
    "classes": [["e_", 11394293, 11397461]],
    "functions": [
      ["normalizePromptText", 11392662, 11392757],
      ["readTextValue", 11392757, 11392883],
      ["extractVisibleUserPromptFromAcpPrompt", 11392883, 11393152],
      ["extractTextFromInputContent", 11393152, 11393437],
      ["extractVisibleUserPromptFromAgentInput", 11393437, 11393834],
      ["buildFrictionTelemetryPayload", 11393834, 11394286],
    ],
    "constants": [
      ["ew", 11392593, 11392626],
      ["eB", 11392630, 11392661],
    ],
    "declarations": [
      ["ew", 11392586, 11392662],
      ["normalizePromptText", 11392662, 11392757],
      ["readTextValue", 11392757, 11392883],
      ["extractVisibleUserPromptFromAcpPrompt", 11392883, 11393152],
      ["extractTextFromInputContent", 11393152, 11393437],
      ["extractVisibleUserPromptFromAgentInput", 11393437, 11393834],
      ["buildFrictionTelemetryPayload", 11393834, 11394286],
      ["e_", 11394286, 11397462],
    ],
    "bindings": [
      ["eC", 82485],
      ["ef", 70724],
    ],
  },
  {
    "key": "recall",
    "sourceModule": 43324,
    "exports": [
      ["FrictionRecallClient", 11398579, 11398585],
      ["FrictionRecallClientImpl", 11398611, 11398617],
      ["parseFrictionRecallResponse", 11398646, 11398677],
    ],
    "classes": [["ev", 11401608, 11402124]],
    "functions": [
      ["normalizeLabel", 11400449, 11400528],
      ["parseFrictionType", 11400528, 11400613],
      ["parseSeverity", 11400613, 11400721],
      ["parseRootCauseCandidate", 11400721, 11400848],
      ["isRecallResult", 11400848, 11401113],
      ["parseFrictionRecallResponse", 11401113, 11401601],
    ],
    "constants": [
      ["eC", 11399268, 11399298],
      ["ey", 11399302, 11399331],
      ["ew", 11399335, 11399338],
      ["eB", 11399342, 11400163],
      ["e_", 11400167, 11400193],
      ["eI", 11400197, 11400448],
    ],
    "declarations": [
      ["eC", 11399261, 11400449],
      ["normalizeLabel", 11400449, 11400528],
      ["parseFrictionType", 11400528, 11400613],
      ["parseSeverity", 11400613, 11400721],
      ["parseRootCauseCandidate", 11400721, 11400848],
      ["isRecallResult", 11400848, 11401113],
      ["parseFrictionRecallResponse", 11401113, 11401601],
      ["ev", 11401601, 11402125],
    ],
    "bindings": [["eE", 82485]],
  },
  {
    "key": "usageUtils",
    "sourceModule": 93039,
    "exports": [],
    "classes": [["UsageUtils", 13258857, 13260089]],
    "functions": [
      ["firstPositiveTokenCount", 13260090, 13260195],
      ["normalizeUsage", 13260195, 13260273],
    ],
    "constants": [],
    "declarations": [
      ["UsageUtils", 13258842, 13260090],
      ["firstPositiveTokenCount", 13260090, 13260195],
      ["normalizeUsage", 13260195, 13260273],
    ],
    "bindings": [
      ["Ac", 69466],
      ["Ag", 18553],
      ["tc", 21580],
    ],
  },
] as const;
export const ACP_SERVICE_FACTORIES = [
  [76586, 10939085, 10939198],
  [20881, 10939199, 10942939],
  [82485, 11398256, 11398510],
  [55114, 15608650, 15618888],
  [59255, 13310370, 13313103],
  [46943, 13313104, 13320096],
  [7340, 13369211, 13369844],
  [82263, 6929074, 6936416],
] as const;
export function createNativeAcpServices(runtime: any = {}) {
  const process: any = {
      env: runtime.env ?? {},
      stdout: { isTTY: runtime.tty ?? false },
    },
    Date: any = runtime.Date ?? globalThis.Date;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const factories: any = {
    76586(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { SessionTitleService: () => eu }));
      let eu = Symbol("SessionTitleService");
    },
    20881(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          getEffectiveSessionTitle: () => getEffectiveSessionTitle,
          getFirstRealUserMessageText: () => getFirstRealUserMessageText,
          getFirstUsableUserMessageText: () => getFirstUsableUserMessageText,
          hasCustomTitle: () => hasCustomTitle,
          hasGeneratedTitle: () => hasGeneratedTitle,
        }));
      var eu = ec(70724),
        ed = ec(69466),
        ep = ec(67019),
        eg = ec(59255),
        eh = ec(46943);
      function isGeneratedPlaceholderTitle(eA) {
        let el = eA?.trim();
        return (
          !el ||
          "(No content)" === el ||
          "/compact" === el ||
          isImageLocalPathTitle(el)
        );
      }
      function isImageLocalPathTitle(eA) {
        return /^<image_local_path>[\s\S]*<\/image_local_path>$/.test(
          eA?.trim() ?? "",
        );
      }
      function hasCustomTitle(eA) {
        for (let el = eA.length - 1; el >= 0; el--) {
          let ec = eA[el];
          if ("custom-title" === ec.type && ec.customTitle?.trim()) return !0;
        }
        return !1;
      }
      function hasGeneratedTitle(eA) {
        for (let el of eA)
          if (
            ("ai-title" === el.type &&
              el.aiTitle?.trim() &&
              !isGeneratedPlaceholderTitle(el.aiTitle)) ||
            ("topic" === el.type &&
              el.topic?.trim() &&
              !isGeneratedPlaceholderTitle(el.topic))
          )
            return !0;
        return !1;
      }
      function getEffectiveSessionTitle(eA) {
        for (let el = eA.length - 1; el >= 0; el--) {
          let ec = eA[el];
          if ("custom-title" === ec.type && ec.customTitle?.trim())
            return ec.customTitle.trim();
        }
        for (let el = eA.length - 1; el >= 0; el--) {
          let ec = eA[el];
          if (
            "ai-title" === ec.type &&
            ec.aiTitle?.trim() &&
            !isGeneratedPlaceholderTitle(ec.aiTitle)
          )
            return ec.aiTitle.trim();
        }
        for (let el = eA.length - 1; el >= 0; el--) {
          let ec = eA[el];
          if (
            "topic" === ec.type &&
            ec.topic?.trim() &&
            !isGeneratedPlaceholderTitle(ec.topic)
          )
            return ec.topic.trim();
        }
        return getFirstRealUserMessageTitle(eA);
      }
      function getFirstRealUserMessageText(eA) {
        for (let el of eA)
          if (isRealUserMessageForTitle(el)) {
            let eA = getUserTitleText(el);
            if (eA) return eA;
          }
      }
      function getFirstUsableUserMessageText(eA, el) {
        for (let ec of eA)
          if (isRealUserMessageForTitle(ec)) {
            let eA = getUserTitleText(ec);
            if (eA && eA.length >= el) return eA;
          }
      }
      function getFirstRealUserMessageTitle(eA) {
        for (let el of eA)
          if (isRealUserMessageForTitle(el)) {
            let eA = getUserTitleText(el);
            if (!eA) continue;
            return eA.length > 80 ? eA.substring(0, 80) + "..." : eA;
          }
      }
      function isRealUserMessageForTitle(eA) {
        if ("message" !== eA.type || "user" !== eA.role) return !1;
        let el = eA.providerData;
        return (
          !el?.skipRun &&
          !el?.isCompactInternal &&
          el?.agent !== ed.AgentNames.COMPACT &&
          "string" != typeof el?.teammateMessage?.from
        );
      }
      function getUserTitleText(eA) {
        if ("string" == typeof eA.content)
          return normalizeTitleText(
            eg.MessageContentUtils.extractTextContent(eA)?.trim(),
          );
        let el = !1;
        for (let ec of eA.content) {
          if (isImageContentBlock(ec)) {
            el = !0;
            continue;
          }
          if (
            "input_text" !== ec.type ||
            ep.CommandMessageUtils.isSystemInternalMessage(ec.text)
          )
            continue;
          let eA = ep.CommandMessageUtils.parseInput(ec.text);
          if (eA) return normalizeTitleText(eA.text.trim());
          let ed = normalizeTitleText(
            ec.providerData && "content" in ec.providerData
              ? String(ec.providerData.content).trim()
              : void 0,
          );
          if (ed) return ed;
          let eg = stripTeammateMessage(
              (0, eu.stripPromptContextXml)(ec.text),
            ).trim(),
            ef = normalizeTitleText(
              eh.MessageUtils.isUserQueryContent(eg)
                ? eh.MessageUtils.stripUserQueryTags(eg).trim()
                : eg,
            );
          if (ef) return ef;
        }
        return el ? getLocalizedImageTitle() : void 0;
      }
      function normalizeTitleText(eA) {
        let el = eA?.trim();
        return isGeneratedPlaceholderTitle(el) ? void 0 : el;
      }
      function isImageContentBlock(eA) {
        return (
          "image_blob_ref" === eA.type ||
          "input_image" === eA.type ||
          "image" === eA.type
        );
      }
      function getLocalizedImageTitle() {
        let eA = String(
          process.env.LC_ALL ||
            process.env.LC_MESSAGES ||
            process.env.LANG ||
            "",
        ).toLowerCase();
        return eA.startsWith("zh") || eA.includes("zh_") || eA.includes("zh-")
          ? "图片"
          : "Image";
      }
      function stripTeammateMessage(eA) {
        return eA
          .replace(
            /<teammate-message\s+teammate_id="([^"]+)"(?:\s+summary="([^"]*)")?[^>]*>\n?([\s\S]*?)\n?<\/teammate-message>/g,
            (eA, el, ec, eu) => {
              if (ec) return `[@${el}] ${ec}`;
              let ed = eu.trim();
              return ed.length > 80
                ? `[@${el}] ${ed.substring(0, 80)}...`
                : `[@${el}] ${ed}`;
            },
          )
          .trim();
      }
    },
    82485(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          isChatPromptFrictionAnalysisEnabled: () =>
            isChatPromptFrictionAnalysisEnabled,
        }));
      var eu = ec(9151);
      function isChatPromptFrictionAnalysisEnabled(eA) {
        return eA?.[eu.ProductFeature.ChatPromptFrictionAnalysis] === !0;
      }
    },
    55114(eA, el) {
      "use strict";
      var ec, eu;
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.FeatureToggle = el.ProductFeature = void 0),
        (function (eA) {
          ((eA.Chat = "Chat"),
            (eA.InlineChat = "InlineChat"),
            (eA.StatusBar = "StatusBar"),
            (eA.ChatVariable = "ChatVariable"),
            (eA.InlineCompletions = "InlineCompletions"),
            (eA.NesCompletions = "NesCompletions"),
            (eA.MergedNesCompletions = "MergedNesCompletions"),
            (eA.SlashCommand = "SlashCommand"),
            (eA.GenerateCommitMessage = "GenerateCommitMessage"),
            (eA.GenerateReadmeFile = "GenerateReadmeFile"),
            (eA.ConfigServer = "ConfigServer"),
            (eA.StopParamPatch = "StopParamPatch"),
            (eA.OpenAIStyleAPI = "OpenAIStyleAPI"),
            (eA.SecretKeyRequired = "SecretKeyRequired"),
            (eA.MultiFileWithPromptParam = "MultiFileWithPromptParam"),
            (eA.MultiFileWithSeparateParams = "MultiFileWithSeparateParams"),
            (eA.TrimByIndentation = "TrimByIndentation"),
            (eA.ASTForCompletions = "ASTForCompletions"),
            (eA.CompletionsPrefetching = "CompletionsPrefetching"),
            (eA.NESPrefetchingAfterEmptyCompletion =
              "NESPrefetchingAfterEmptyCompletion"),
            (eA.TriggerNESAfterCompletionHasBeenAccepted =
              "TriggerNESAfterCompletionHasBeenAccepted"),
            (eA.CursorPositonPrefetching = "CursorPositonPrefetching"),
            (eA.CompletionsRelatedSnippets = "CompletionsRelatedSnippets"),
            (eA.ImportMetadataForCompletions = "ImportMetadataForCompletions"),
            (eA.CompletionItemsForCompletions =
              "CompletionItemsForCompletions"),
            (eA.NesDocumentActiveChangeTrigger =
              "NesDocumentActiveChangeTrigger"),
            (eA.NesCompletionsPrefetching = "NesCompletionsPrefetching"),
            (eA.NesCompletionsJumpToHere = "NesCompletionsJumpToHere"),
            (eA.RemoveBelowExist = "RemoveBelowExist"),
            (eA.NesRepeatFilter = "NesRepeatFilter"),
            (eA.NesRepeatFilterV2 = "NesRepeatFilterV2"),
            (eA.NesRangeFix = "NesRangeFix"),
            (eA.CompletionsResultFusion = "CompletionsResultFusion"),
            (eA.ChatHistory = "ChatHistory"),
            (eA.InlineChatSelectionAppendToResult =
              "InlineChatSelectionAppendToResult"),
            (eA.ChatFollowup = "ChatFollowup"),
            (eA.CRLFCompatible = "CRLFCompatible"),
            (eA.CodeAction = "CodeAction"),
            (eA.CodeActionIDE = "CodeActionIDE"),
            (eA.FloatShortcut = "FloatShortcut"),
            (eA.CodeLens = "CodeLens"),
            (eA.InlineChatIntentRecognition = "InlineChatIntentRecognition"),
            (eA.MultiStepCompletions = "MultiStepCompletions"),
            (eA.Codebase = "Codebase"),
            (eA.UseDefaultModelIfCurrentNotInList =
              "UseDefaultModelIfCurrentNotInList"),
            (eA.Mcp = "Mcp"),
            (eA.McpMarket = "McpMarket"),
            (eA.McpInstallationGuide = "McpInstallationGuide"),
            (eA.DisableMcpSampling = "DisableMcpSampling"),
            (eA.DisableMcpRoots = "DisableMcpRoots"),
            (eA.MemoryManagement = "MemoryManagement"),
            (eA.DisableMemoryPersonalization = "DisableMemoryPersonalization"),
            (eA.PoiMap = "PoiMap"),
            (eA.NicknameEditEnabled = "NicknameEditEnabled"),
            (eA.SelectImage = "SelectImage"),
            (eA.SelectFigma = "SelectFigma"),
            (eA.SelectComponent = "SelectComponent"),
            (eA.Aegis = "Aegis"),
            (eA.BillingNotice = "BillingNotice"),
            (eA.VSCodeAuthProvider = "VSCodeAuthProvider"),
            (eA.TerminalChatIDE = "TerminalChatIDE"),
            (eA.InlineChatIDE = "InlineChatIDE"),
            (eA.Integration = "Integration"),
            (eA.PdcFlow = "PdcFlow"),
            (eA.AdditionalPrompt = "AdditionalPrompt"),
            (eA.CustomModel = "CustomModel"),
            (eA.CommandsSmartMerge = "CommandsSmartMerge"),
            (eA.WriteAndReplaceToolIDE = "WriteAndReplaceToolIDE"),
            (eA.GeneralSettings = "GeneralSettings"),
            (eA.Billing = "Billing"),
            (eA.AutoMode = "AutoMode"),
            (eA.isIDE = "isIDE"),
            (eA.WebFetch = "WebFetch"),
            (eA.SummaryWebFetch = "SummaryWebFetch"),
            (eA.WebBrowserFetch = "WebBrowserFetch"),
            (eA.WebSearch = "WebSearch"),
            (eA.DynamicAddWebSearch = "DynamicAddWebSearch"),
            (eA.Skills = "Skills"),
            (eA.SkillSecurityScan = "SkillSecurityScan"),
            (eA.SkillRecommend = "SkillRecommend"),
            (eA.IntentRecommend = "IntentRecommend"),
            (eA.CodeSelectionActions = "CodeSelectionActions"),
            (eA.DisableDeleteFilesTool = "DisableDeleteFilesTool"),
            (eA.DisableHtmlStreamUIShow = "DisableHtmlStreamUIShow"),
            (eA.ProposalAPI = "ProposalAPI"),
            (eA.PreviewUrl = "PreviewUrl"),
            (eA.NESNativeRenderer = "NESNativeRenderer"),
            (eA.EnterpriseDomainLogin = "EnterpriseDomainLogin"),
            (eA.SwitchBySession = "SwitchBySession"),
            (eA.InternationalLogin = "InternationalLogin"),
            (eA.Task = "Task"),
            (eA.CustomModelsJSON = "CustomModelsJSON"),
            (eA.CustomModelIdPrefix = "CustomModelIdPrefix"),
            (eA.CustomModelHideDefaultProvider =
              "CustomModelHideDefaultProvider"),
            (eA.CustomModelProviderLabelI18nOnly =
              "CustomModelProviderLabelI18nOnly"),
            (eA.CloudAgentsSmartMerge = "CloudAgentsSmartMerge"),
            (eA.HideCustomBrandingLogos = "HideCustomBrandingLogos"),
            (eA.CBChatUI = "CBChatUI"),
            (eA.ChatMessageQueue = "ChatMessageQueue"),
            (eA.MessageQueuePluginDispatch = "MessageQueuePluginDispatch"),
            (eA.MessageQueueDeferredDispatch = "MessageQueueDeferredDispatch"),
            (eA.TaskList = "TaskList"),
            (eA.Plan = "Plan"),
            (eA.ReplaceFileEscapeNormalization =
              "ReplaceFileEscapeNormalization"),
            (eA.StandaloneTerminal = "StandaloneTerminal"),
            (eA.ReplaceFileChinesePunctuationNormalization =
              "ReplaceFileChinesePunctuationNormalization"),
            (eA.EnhancedCompletionRequest = "EnhancedCompletionRequest"),
            (eA.ReportAfterCancel = "ReportAfterCancel"),
            (eA.DisableTerminalVariable = "DisableTerminalVariable"),
            (eA.RequestBodyGzip = "RequestBodyGzip"),
            (eA.DisableCreditsConsumed = "DisableCreditsConsumed"),
            (eA.ShowCreditsBalance = "ShowCreditsBalance"),
            (eA.DisableCreditsEntry = "DisableCreditsEntry"),
            (eA.DisableManageCenterEntry = "DisableManageCenterEntry"),
            (eA.DisablePublishedApps = "DisablePublishedApps"),
            (eA.DisableArchivedTasks = "DisableArchivedTasks"),
            (eA.DisableCloudAssistantUpgradeBanner =
              "DisableCloudAssistantUpgradeBanner"),
            (eA.DisableTeamsProject = "DisableTeamsProject"),
            (eA.DisableInspirationEntry = "DisableInspirationEntry"),
            (eA.HomePlaybooks = "HomePlaybooks"),
            (eA.GaokaoEnabled = "gaokaoEnabled"),
            (eA.DisableHomePlaybookShuffle = "DisableHomePlaybookShuffle"),
            (eA.DisableCheckin = "DisableCheckin"),
            (eA.DisableActivityBanner = "DisableActivityBanner"),
            (eA.EnableAppearance = "EnableAppearance"),
            (eA.DisableCreditPurchaseGuide = "DisableCreditPurchaseGuide"),
            (eA.ChannelSlack = "ChannelSlack"),
            (eA.ChannelTelegram = "ChannelTelegram"),
            (eA.ChannelDiscord = "ChannelDiscord"),
            (eA.ChannelWechatKf = "ChannelWechatKf"),
            (eA.DisableContextUsage = "DisableContextUsage"),
            (eA.FileHistoryTracker = "FileHistoryTracker"),
            (eA.ShellIntegrationFix = "ShellIntegrationFix"),
            (eA.DisableCodebase = "DisableCodebase"),
            (eA.DisablePlugin = "DisablePlugin"),
            (eA.DisableWechatMiniProgramIntegration =
              "DisableWechatMiniProgramIntegration"),
            (eA.DisableWecomBotIntegration = "DisableWecomBotIntegration"),
            (eA.EnableWechatShareFile = "EnableWechatShareFile"),
            (eA.DisableLoginLegalLinks = "DisableLoginLegalLinks"),
            (eA.DisableBotWebhookUrl = "DisableBotWebhookUrl"),
            (eA.DisableWecomAibot = "DisableWecomAibot"),
            (eA.EnableWecomAibotCustomWsUrl = "EnableWecomAibotCustomWsUrl"),
            (eA.UserGrowth = "UserGrowth"),
            (eA.DisableGrowthBuddySlot = "DisableGrowthBuddySlot"),
            (eA.DisableSlotSystem = "DisableSlotSystem"),
            (eA.LSP = "LSP"),
            (eA.DisableHooks = "DisableHooks"),
            (eA.RepositorySensitivityDetection =
              "RepositorySensitivityDetection"),
            (eA.BannerDecorativeImage = "BannerDecorativeImage"),
            (eA.SystemMemoryMonitor = "SystemMemoryMonitor"),
            (eA.UseNativeAuth = "UseNativeAuth"),
            (eA.ShowAccountManagementMenu = "ShowAccountManagementMenu"),
            (eA.ShowUsageEntry = "ShowUsageEntry"),
            (eA.ImageGen = "ImageGen"),
            (eA.ImageEdit = "ImageEdit"),
            (eA.VideoGen = "VideoGen"),
            (eA.DisableMultiAgentConcurrent = "DisableMultiAgentConcurrent"),
            (eA.DeferToolLoading = "DeferToolLoading"),
            (eA.DnsFallbackLookup = "EnableDnsFallback"),
            (eA.DisableAgentTeam = "DisableAgentTeam"),
            (eA.Agents = "Agents"),
            (eA.RemoteControl = "RemoteControl"),
            (eA.FileDiffHistory = "FileDiffHistory"),
            (eA.ScheduledTasks = "ScheduledTasks"),
            (eA.BillingUpgradeBanner = "BillingUpgradeBanner"),
            (eA.WorkBuddyBanner = "WorkBuddyBanner"),
            (eA.DisableIdentityBootstrap = "DisableIdentityBootstrap"),
            (eA.DisableIdentityCustomization = "DisableIdentityCustomization"),
            (eA.AllowIdentityNameEdit = "AllowIdentityNameEdit"),
            (eA.DisableTlsVerification = "DisableTlsVerification"),
            (eA.ShowFileChangesForNonGitRepo = "ShowFileChangesForNonGitRepo"),
            (eA.Inspiration = "Inspiration"),
            (eA.Connector = "Connector"),
            (eA.TencentDesignX = "TencentDesignX"),
            (eA.HtmlPreviewShare = "HtmlPreviewShare"),
            (eA.Sandbox = "Sandbox"),
            (eA.SandboxFileVersionManagement = "SandboxFileVersionManagement"),
            (eA.SkillManage = "SkillManage"),
            (eA.TencentDocsKnowledge = "TencentDocsKnowledge"),
            (eA.TencentDocsAiEdit = "TencentDocsAiEdit"),
            (eA.TencentDocsAiEditEnterprise = "TencentDocsAiEditEnterprise"),
            (eA.TencentPptxBuiltinDefaultEnabled =
              "TencentPptxBuiltinDefaultEnabled"),
            (eA.TencentLexiangKnowledge = "TencentLexiangKnowledge"),
            (eA.TencentNetDriveKnowledge = "TencentNetDriveKnowledge"),
            (eA.DisableHelpFeedback = "DisableHelpFeedback"),
            (eA.ShowAboutQRCodes = "ShowAboutQRCodes"),
            (eA.DisableDocumentation = "DisableDocumentation"),
            (eA.DisableYuanbaoChannel = "DisableYuanbaoChannel"),
            (eA.DisableYuanbaoSearchEntry = "DisableYuanbaoSearchEntry"),
            (eA.DisableMultimodalGeneration = "DisableMultimodalGeneration"),
            (eA.DefaultModelOptimizationOff = "DefaultModelOptimizationOff"),
            (eA.SystemProxyDetection = "SystemProxyDetection"),
            (eA.DisableShareFeature = "DisableShareFeature"),
            (eA.DisableHomeQuickEntries = "DisableHomeQuickEntries"),
            (eA.EnterpriseConsole = "EnterpriseConsole"),
            (eA.WelcomeAppsConnectors = "WelcomeAppsConnectors"),
            (eA.ContextSummaryAgent = "ContextSummaryAgent"),
            (eA.EnablePreMessageCompact = "enablePreMessageCompact"),
            (eA.DisableExpertManagement = "DisableExpertManagement"),
            (eA.DisableVoiceInput = "DisableVoiceInput"),
            (eA.DisableVoiceOutput = "DisableVoiceOutput"),
            (eA.SkipToolCallSupportCheck = "SkipToolCallSupportCheck"),
            (eA.EnableEnterpriseCustomModelPolicy =
              "EnableEnterpriseCustomModelPolicy"),
            (eA.EnableEnterpriseSkillUploadPolicy =
              "EnableEnterpriseSkillUploadPolicy"),
            (eA.WebFetchRemoteApi = "WebFetchRemoteApi"),
            (eA.EnableEnterpriseLicenseCheck = "EnableEnterpriseLicenseCheck"),
            (eA.EnableClawChannelControl = "EnableClawChannelControl"),
            (eA.CodeAdoptionRate = "CodeAdoptionRate"),
            (eA.ChatPromptFrictionAnalysis = "ChatPromptFrictionAnalysis"),
            (eA.Claw = "Claw"),
            (eA.Automation = "Automation"),
            (eA.Discover = "Discover"),
            (eA.AgentMail = "AgentMail"),
            (eA.EnableSecurityCenter = "EnableSecurityCenter"),
            (eA.WeixinPayInterception = "WeixinPayInterception"),
            (eA.IOAImWhitelistEligible = "IOAImWhitelistEligible"),
            (eA.HomePracticeCases = "HomePracticeCases"),
            (eA.HidePresetBuiltinSkills = "HidePresetBuiltinSkills"),
            (eA.DisableUpdateChangelog = "DisableUpdateChangelog"),
            (eA.ProjectLocalTask = "ProjectLocalTask"),
            (eA.EnableProjectPin = "EnableProjectPin"),
            (eA.TodoAssistantDelegate = "TodoAssistantDelegate"),
            (eA.DisableSkillHub = "DisableSkillHub"),
            (eA.DisableStorageUpgradeEntry = "DisableStorageUpgradeEntry"),
            (eA.Space = "Space"),
            (eA.DisableBuiltinPluginMarketplace =
              "DisableBuiltinPluginMarketplace"),
            (eA.EnableClientMenuInAppNavigation =
              "EnableClientMenuInAppNavigation"));
        })(ec || (el.ProductFeature = ec = {})),
        (function (eA) {
          ((eA.SupportHttpsAgentProxy = "SupportHttpsAgentProxy"),
            (eA.ShowFileDiffOnClick = "ShowFileDiffOnClick"),
            (eA.EnableUserMessageTopAlignment =
              "EnableUserMessageTopAlignment"),
            (eA.QueueBanner = "QueueBanner"));
        })(eu || (el.FeatureToggle = eu = {})));
    },
    59255(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { MessageContentUtils: () => MessageContentUtils }));
      var eu = ec(70724),
        ed = ec(20881),
        ep = ec(6350),
        eg = ec(67019),
        eh = ec(46943);
      let MessageContentUtils = class MessageContentUtils {
        static hasVisibleContent(eA) {
          if ("string" == typeof eA.content) return !0;
          for (let el of eA.content)
            if (
              !(
                "input_text" !== el.type ||
                eg.CommandMessageUtils.isSystemInternalMessage(el.text) ||
                MessageContentUtils.isImageLocalPathBlock(el.text)
              ) &&
              void 0 === eg.CommandMessageUtils.parseOutput(el.text)
            )
              return !0;
          return !1;
        }
        static extractTextContent(eA, el) {
          if ("string" == typeof eA.content) {
            let ec = MessageContentUtils.stripTeammateMessage(
              MessageContentUtils.stripSystemReminder(eA.content),
            );
            return el ? ec : ec.replace(/\r\n|\r|\n/g, "");
          }
          let ec = ep.TOOL_NO_CONTENT;
          for (let el of eA.content) {
            if (
              "input_text" !== el.type ||
              eg.CommandMessageUtils.isSystemInternalMessage(el.text) ||
              MessageContentUtils.isImageLocalPathBlock(el.text)
            )
              continue;
            let eA = eg.CommandMessageUtils.parseInput(el.text);
            if (void 0 !== eA) {
              ec = eA.text;
              break;
            }
            if (el.providerData && "content" in el.providerData) {
              ec = el.providerData.content;
              break;
            }
            let eu = MessageContentUtils.stripTeammateMessage(
              MessageContentUtils.stripSystemReminder(el.text),
            );
            if (eh.MessageUtils.isUserQueryContent(eu)) {
              ec = eh.MessageUtils.stripUserQueryTags(eu);
              break;
            }
            ec = eu;
          }
          return el ? ec : ec.replace(/\r\n|\r|\n/g, "");
        }
        static getLatestRealUserMessage(eA) {
          if (!Array.isArray(eA) || 0 === eA.length) return;
          let el = [...eA]
            .reverse()
            .filter((eA) => "message" === eA.type && "user" === eA.role)
            .find(
              (eA) =>
                !eA.providerData?.skipRun &&
                !!MessageContentUtils.extractTextContent(eA, !1).trim(),
            );
          return el
            ? MessageContentUtils.extractTextContent(el, !1).trim()
            : void 0;
        }
        static stripSystemReminder(eA) {
          return (0, eu.stripPromptContextXml)(eA);
        }
        static isImageLocalPathBlock(eA) {
          return /^<image_local_path>[\s\S]*<\/image_local_path>$/.test(
            eA?.trim() ?? "",
          );
        }
        static stripTeammateMessage(eA) {
          return eA
            .replace(
              /<teammate-message\s+teammate_id="([^"]+)"(?:\s+summary="([^"]*)")?[^>]*>\n?([\s\S]*?)\n?<\/teammate-message>/g,
              (eA, el, ec, eu) => {
                if (ec) return `[@${el}] ${ec}`;
                let ed = eu.trim();
                return ed.length > 80
                  ? `[@${el}] ${ed.substring(0, 80)}...`
                  : `[@${el}] ${ed}`;
              },
            )
            .trim();
        }
        static getAISummary(eA) {
          for (let el = eA.length - 1; el >= 0; el--) {
            let ec = eA[el];
            if ("summary" === ec.type) return ec.summary;
          }
        }
        static getSessionSummary(eA) {
          let el = MessageContentUtils.getAISummary(eA);
          if (el) return el;
          let ec = [...eA]
              .reverse()
              .filter((eA) => "message" === eA.type && "user" === eA.role),
            eu =
              ec.find(
                (eA) =>
                  !eA.providerData?.skipRun &&
                  MessageContentUtils.hasVisibleContent(eA),
              ) ||
              ec.find(
                (eA) =>
                  eA.providerData?.skipRun &&
                  MessageContentUtils.hasVisibleContent(eA),
              );
          return eu && "message" === eu.type
            ? MessageContentUtils.extractTextContent(eu)
            : ep.TOOL_NO_CONTENT;
        }
        static getSessionName(eA) {
          return (0, ed.getEffectiveSessionTitle)(eA);
        }
      };
    },
    46943(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { MessageUtils: () => MessageUtils }));
      var eu = ec(70724);
      let ed = "<user_query>",
        ep = "</user_query>",
        eg = /<user_query>[\s\S]*?<\/user_query>/g;
      let MessageUtils = class MessageUtils {
        static mergeConsecutiveUserMessages(eA) {
          if (0 === eA.length) return eA;
          let el = [],
            ec = [];
          for (let eu of eA)
            if ("message" === eu.type && "user" === eu.role) {
              let eA = eu;
              eA.providerData?.teammateMessage
                ? (ec.length > 0 &&
                    (el.push(this.mergeUserMessageGroup(ec)), (ec = [])),
                  el.push(eA))
                : ec.push(eA);
            } else
              (ec.length > 0 &&
                (el.push(this.mergeUserMessageGroup(ec)), (ec = [])),
                el.push(eu));
          return (ec.length > 0 && el.push(this.mergeUserMessageGroup(ec)), el);
        }
        static mergeUserMessageGroup(eA) {
          if (1 === eA.length) return eA[0];
          let el = [];
          for (let ec of eA)
            "string" == typeof ec.content
              ? el.push({ type: "input_text", text: ec.content })
              : Array.isArray(ec.content) && el.push(...ec.content);
          return { ...eA[0], content: el };
        }
        static addSystemReminder(eA, el, ec = "last") {
          let eu =
            "first" === ec
              ? this.findFirstUserMessage(eA)
              : this.findLastUserMessage(eA);
          eu &&
            (this.ensureContentIsArray(eu),
            Array.isArray(eu.content) &&
              eu.content.unshift({ type: "input_text", text: el }));
        }
        static findFirstUserMessage(eA) {
          return eA.find((eA) => "message" === eA.type && "user" === eA.role);
        }
        static findLastUserMessage(eA) {
          for (let el = eA.length - 1; el >= 0; el--) {
            let ec = eA[el];
            if ("message" === ec.type && "user" === ec.role) return ec;
          }
        }
        static firstUserMessageContainsRole(eA, el) {
          let ec = this.findFirstUserMessage(eA);
          if (!ec) return !1;
          let eu = `data-role="${el}"`,
            ed = ec.content;
          if ("string" == typeof ed) return ed.includes(eu);
          if (Array.isArray(ed)) {
            for (let eA of ed)
              if (
                "input_text" === eA.type &&
                "string" == typeof eA.text &&
                eA.text.includes(eu)
              )
                return !0;
          }
          return !1;
        }
        static ensureContentIsArray(eA) {
          "string" == typeof eA.content &&
            (eA.content = [{ type: "input_text", text: eA.content }]);
        }
        static extractSystemReminders(eA) {
          let el = [];
          for (let ec of eA)
            if ("message" === ec.type && "user" === ec.role) {
              let eA = ec.content;
              if ("string" == typeof eA) {
                let ec = eA.match(
                  /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g,
                );
                ec && el.push(...ec);
              } else if (Array.isArray(eA)) {
                for (let ec of eA)
                  if ("input_text" === ec.type && "string" == typeof ec.text) {
                    let eA = ec.text.match(
                      /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g,
                    );
                    eA && el.push(...eA);
                  }
              }
            }
          return el;
        }
        static filterSystemReminders(eA) {
          for (let el of eA)
            if ("message" === el.type && "user" === el.role) {
              let eA = el;
              if ("string" == typeof eA.content)
                eA.content = (0, eu.stripSystemReminderXml)(eA.content);
              else if (Array.isArray(eA.content)) {
                for (let el of eA.content)
                  "input_text" === el.type &&
                    "string" == typeof el.text &&
                    (el.text = (0, eu.stripSystemReminderXml)(el.text));
                eA.content = eA.content.filter(
                  (eA) =>
                    "input_text" !== eA.type ||
                    (eA.text && eA.text.trim().length > 0),
                );
              }
            }
          return eA;
        }
        static stripUserQueryTagsFromMessages(eA) {
          for (let el of eA)
            if ("message" === el.type && "user" === el.role) {
              let eA = el;
              if ("string" == typeof eA.content)
                eA.content = (0, eu.stripUserQueryXml)(eA.content);
              else if (Array.isArray(eA.content))
                for (let el of eA.content)
                  "input_text" === el.type &&
                    "string" == typeof el.text &&
                    (el.text = (0, eu.stripUserQueryXml)(el.text));
            }
          return eA;
        }
        static createFilteredCopyForCompaction(eA) {
          let el = JSON.parse(JSON.stringify(eA));
          return (
            this.filterHiddenSystemRemindersForCompaction(el),
            this.stripUserQueryTagsFromMessages(el)
          );
        }
        static filterHiddenSystemRemindersForCompaction(eA) {
          for (let el of eA) {
            if ("message" !== el.type || "user" !== el.role) continue;
            let eA = el;
            if ("string" == typeof eA.content)
              eA.content = this.stripSystemRemindersOutsideUserQuery(
                eA.content,
              );
            else if (Array.isArray(eA.content)) {
              for (let el of eA.content)
                "input_text" === el.type &&
                  "string" == typeof el.text &&
                  (el.text = this.stripSystemRemindersOutsideUserQuery(
                    el.text,
                  ));
              eA.content = eA.content.filter(
                (eA) =>
                  "input_text" !== eA.type ||
                  (eA.text && eA.text.trim().length > 0),
              );
            }
          }
          return eA;
        }
        static stripSystemRemindersOutsideUserQuery(eA) {
          let el = [],
            ec = "__CODEBUDDY_USER_QUERY_BLOCK_",
            ed = eA.replace(eg, (eA) => {
              let eu = `${ec}${el.length}__`;
              return (el.push(eA), eu);
            });
          return (0, eu.stripSystemReminderXml)(ed).replace(
            RegExp(`${ec}(\\d+)__`, "g"),
            (eA, ec) => el[Number(ec)] ?? "",
          );
        }
        static performMicrocompact(eA, el) {
          let ec = new Set([
              "Read",
              "Bash",
              "Grep",
              "Glob",
              "WebFetch",
              "WebSearch",
              "Edit",
              "MultiEdit",
              "Write",
            ]),
            eu = "[Old tool result content cleared by microcompact]";
          if (el?.keepRecent !== void 0) {
            let ed = el.keepRecent,
              ep = el.maxCharsPerResult ?? 1500,
              eg = [];
            for (let el = 0; el < eA.length; el++) {
              let eu = eA[el];
              "function_call_result" === eu.type &&
                eu.name &&
                ec.has(eu.name) &&
                eg.push(el);
            }
            let eh = Math.max(0, eg.length - ed),
              ef = 0,
              em = 0;
            for (let el = 0; el < eg.length; el++) {
              let ec = eA[eg[el]];
              el < eh
                ? (void 0 !== ec.output &&
                    (ec.output = { type: "text", text: eu }),
                  ec.providerData?.toolResult &&
                    (ec.providerData.toolResult = { content: eu }),
                  ef++)
                : (em += this.truncateToolResultContent(ec, ep));
            }
            (ef > 0 || em > 0) &&
              process.stderr
                .write(`[Microcompact] Aggressive: cleared ${ef}, truncated ${em} tool results, kept ${eg.length - ef} recent (maxChars=${ep}, from ${eA.length} items)
`);
            return;
          }
          let ed = Date.now(),
            ep = ed - 36e5,
            eg = 0;
          for (let el of eA) {
            let eA = el;
            if ("function_call_result" !== eA.type) continue;
            let eh = eA.name;
            eh &&
              ec.has(eh) &&
              !((eA.timestamp || ed) > ep) &&
              (void 0 !== eA.output && (eA.output = { type: "text", text: eu }),
              eA.providerData?.toolResult &&
                (eA.providerData.toolResult = { content: eu }),
              eg++);
          }
          eg > 0 &&
            process.stderr
              .write(`[Microcompact] Cleared ${eg} old tool results from ${eA.length} items
`);
        }
        static truncateToolResultContent(eA, el) {
          let ec = !1,
            eu =
              "\n\n[... content truncated by microcompact to fit context limit]";
          if (
            (eA.output &&
            "object" == typeof eA.output &&
            "string" == typeof eA.output.text
              ? eA.output.text.length > el &&
                ((eA.output.text = eA.output.text.slice(0, el) + eu), (ec = !0))
              : "string" == typeof eA.output &&
                eA.output.length > el &&
                ((eA.output = eA.output.slice(0, el) + eu), (ec = !0)),
            eA.providerData?.toolResult)
          ) {
            let ed = eA.providerData.toolResult;
            "string" == typeof ed.content &&
              ed.content.length > el &&
              ((ed.content = ed.content.slice(0, el) + eu), (ec = !0));
          }
          return +!!ec;
        }
        static stripImagesForCompaction(eA) {
          let el = 0;
          for (let ec of eA) {
            let eA = ec;
            if (
              "message" === eA.type &&
              "user" === eA.role &&
              Array.isArray(eA.content)
            )
              for (let ec = 0; ec < eA.content.length; ec++) {
                let eu = eA.content[ec];
                (eu?.type === "input_image" || eu?.type === "image") &&
                  ((eA.content[ec] = { type: "input_text", text: "[image]" }),
                  el++);
              }
            if ("function_call_result" === eA.type) {
              let ec = eA.output;
              ec &&
                "object" == typeof ec &&
                ("image" === ec.type || ec.media_type) &&
                ((eA.output = { type: "text", text: "[image]" }), el++);
            }
          }
          el > 0 &&
            process.stderr.write(`[Compact] Stripped ${el} images from messages
`);
        }
        static isSystemInjectedContent(eA) {
          return (
            eA.includes("<system-reminder") ||
            eA.includes("<command-message>") ||
            eA.includes("<command-name>") ||
            eA.includes("<local-command-stdout>") ||
            eA.includes("<channel ") ||
            eA.includes("<cb_summary>") ||
            eA.includes("<conversation_history_summary>") ||
            eA.includes("<task-notification>")
          );
        }
        static isUserQueryContent(eA) {
          return "string" == typeof eA && eA.startsWith(ed) && eA.endsWith(ep);
        }
        static wrapUserQuery(eA) {
          return `<user_query>${eA}</user_query>`;
        }
        static stripUserQueryTags(eA) {
          if ("string" != typeof eA || !eA.includes(ed)) return eA;
          let el = RegExp(`${ed}([\\s\\S]*?)${ep}`, "g");
          return eA.replace(el, (eA, el) => el.trim()).trim();
        }
        static stripSystemReminders(eA) {
          return (0, eu.stripSystemReminderXml)(eA);
        }
      };
    },
    7340(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { SessionUtils: () => SessionUtils }));
      var eu = ec(80699),
        ed = ec(35151);
      let ep = "agent-";
      let SessionUtils = class SessionUtils {
        static is(eA) {
          return eA instanceof Object && "id" in eA && "history" in eA;
        }
        static subAgentId() {
          let eA = (0, eu.generateUUUID)().replace(/-/g, "").substring(0, 8);
          return `${ep}${eA}`;
        }
        static isSubAgent(eA) {
          return !!eA.storeId && eA.storeId !== eA.id;
        }
        static isTeamSession(eA) {
          let el = eA?.meta;
          return !!(el?.isTeamLead || el?.isTeamMember);
        }
        static resolveTaskSessionId(eA) {
          let el = process.env[ed.ENV_KEY_CODEBUDDY_TASK_LIST_ID];
          return el && "" !== el.trim()
            ? el.trim()
            : eA?.meta?.parentSessionId || eA?.id;
        }
      };
    },
    82263(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          META_KEY_CONTEXT_USAGE_BY_CATEGORY: () => e_,
          buildSessionUsageUpdate: () => buildSessionUsageUpdate,
          computeSessionUsageByCategory: () => computeSessionUsageByCategory,
          resolveSessionContextSize: () => resolveSessionContextSize,
        }));
      var eu = ec(93039);
      let ed = 1.2,
        ep = 0.25,
        eg = 0.7;
      function weighted(eA) {
        if (!eA) return 0;
        let el = 0,
          ec = 0,
          eu = 0;
        for (let ed = 0; ed < eA.length; ed++) {
          let ep = eA.codePointAt(ed);
          void 0 !== ep &&
            (ep > 65535 && (ed += 1),
            isCjk(ep)
              ? (el += 1)
              : isAsciiLetterOrWhitespace(ep)
                ? (ec += 1)
                : (eu += 1));
        }
        return el * ed + ec * ep + eu * eg;
      }
      function isCjk(eA) {
        return (
          (eA >= 19968 && eA <= 40959) ||
          (eA >= 13312 && eA <= 19903) ||
          (eA >= 131072 && eA <= 191471) ||
          (eA >= 63744 && eA <= 64255) ||
          (eA >= 12352 && eA <= 12447) ||
          (eA >= 12448 && eA <= 12543) ||
          (eA >= 44032 && eA <= 55215) ||
          !1
        );
      }
      function isAsciiLetterOrWhitespace(eA) {
        return (
          (!!(eA >= 65) && !!(eA <= 90)) ||
          (!!(eA >= 97) && !!(eA <= 122)) ||
          32 === eA ||
          9 === eA ||
          10 === eA ||
          13 === eA
        );
      }
      let eh = ["systemPrompt", "conversation", "tools", "mcp", "skills"];
      function distributeWithConservation(eA, el) {
        let ec =
          eA.systemPrompt + eA.conversation + eA.tools + eA.mcp + eA.skills;
        if (ec <= 0)
          return {
            systemPrompt: 0,
            conversation: el,
            tools: 0,
            mcp: 0,
            skills: 0,
          };
        let eu = eh.map((eu) => {
            let ed = (eA[eu] / ec) * el,
              ep = Math.floor(ed);
            return { key: eu, floor: ep, remainder: ed - ep };
          }),
          ed = 0;
        for (let eA of eu) ed += eA.floor;
        let ep = el - ed;
        if (ep > 0) {
          let eA = [...eu].sort((eA, el) => el.remainder - eA.remainder);
          for (let el = 0; el < ep && el < eA.length; el++) eA[el].floor += 1;
        }
        let eg = {
          systemPrompt: 0,
          conversation: 0,
          tools: 0,
          mcp: 0,
          skills: 0,
        };
        for (let eA of eu) eg[eA.key] = eA.floor;
        return eg;
      }
      let ef = "Skill",
        em = "ToolSearch",
        eE = /<available_skills>[\s\S]*?<\/available_skills>/gi,
        eC = /^[^\n]*\bmcp__[^\n]*$/gm;
      function collectToolsBuckets(eA) {
        let el = [],
          ec = [],
          eu = [];
        for (let ed of eA) {
          let eA;
          if (isPlainObject(ed)) {
            try {
              eA = JSON.stringify(ed);
            } catch {
              continue;
            }
            if (eA) {
              if (ed.name === ef && "string" == typeof ed.description)
                for (let el of matchAll(ed.description, eE))
                  (eu.push(el), (eA = removeFirst(eA, el)));
              if (ed.name === em && "string" == typeof ed.description)
                for (let el of matchAll(ed.description, eC))
                  (ec.push(el), (eA = removeFirst(eA, el)));
              el.push(eA);
            }
          }
        }
        return {
          toolsChars: el.join(""),
          mcpChars: ec.join(""),
          skillsChars: eu.join(""),
        };
      }
      function matchAll(eA, el) {
        let ec,
          eu = new RegExp(el.source, el.flags),
          ed = [];
        for (; null !== (ec = eu.exec(eA)); )
          (ed.push(ec[0]), ec.index === eu.lastIndex && (eu.lastIndex += 1));
        return ed;
      }
      function removeFirst(eA, el) {
        if (!el) return eA;
        let ec = eA.indexOf(el);
        return ec < 0 ? eA : eA.slice(0, ec) + eA.slice(ec + el.length);
      }
      function isPlainObject(eA) {
        return "object" == typeof eA && null !== eA && !Array.isArray(eA);
      }
      let ey = 85,
        ew =
          /<system-reminder\s+data-role="user-context">([\s\S]*?)<\/system-reminder>/i,
        eB = /<([a-zA-Z_][\w-]*)\b[^>]*>[\s\S]*?<\/\1>/;
      let UsageByCategoryCalculator = class UsageByCategoryCalculator {
        static compute(eA) {
          if (!eA || !Number.isFinite(eA.totalTokens) || eA.totalTokens <= 0)
            return zeroUsageByCategory();
          let el = collectSystemPromptChars(eA),
            ec = collectConversationChars(eA),
            {
              toolsChars: eu,
              mcpChars: ed,
              skillsChars: ep,
            } = collectToolsBuckets(eA.tools),
            eg = countImagePieces(eA.history);
          return {
            ...distributeWithConservation(
              {
                systemPrompt: weighted(el),
                conversation: weighted(ec) + eg * ey,
                tools: weighted(eu),
                mcp: weighted(ed),
                skills: weighted(ep),
              },
              eA.totalTokens,
            ),
            version: 1,
          };
        }
      };
      function zeroUsageByCategory() {
        return {
          systemPrompt: 0,
          conversation: 0,
          tools: 0,
          mcp: 0,
          skills: 0,
          version: 1,
        };
      }
      function collectSystemPromptChars(eA) {
        let el = [];
        for (let ec of ("string" == typeof eA.systemPrompt &&
          el.push(eA.systemPrompt),
        eA.history)) {
          if (
            !usage_by_category_calculator_isPlainObject(ec) ||
            "message" !== ec.type ||
            "user" !== ec.role
          )
            continue;
          let eA = collectUserMessageText(ec.content);
          if (!eA) continue;
          let eu = extractFirstHiddenSection(eA);
          eu && el.push(eu);
        }
        return el.join("");
      }
      function collectConversationChars(eA) {
        let el = [];
        for (let ec of eA.history)
          if (usage_by_category_calculator_isPlainObject(ec)) {
            if ("message" === ec.type) {
              let eA = collectUserMessageText(ec.content);
              if (!eA) continue;
              "user" === ec.role
                ? el.push(stripFirstHiddenSection(eA))
                : el.push(eA);
              continue;
            }
            if ("function_call" === ec.type) {
              try {
                el.push(
                  JSON.stringify({
                    type: "function_call",
                    name: ec.name,
                    callId: ec.callId,
                    arguments: ec.arguments,
                  }),
                );
              } catch {}
              continue;
            }
            if ("function_call_result" === ec.type) {
              el.push(collectToolResultText(ec.output));
              continue;
            }
          }
        return el.join("");
      }
      function collectToolResultText(eA) {
        if ("string" == typeof eA) return eA;
        if (!eA) return "";
        if (Array.isArray(eA)) {
          let el = [];
          for (let ec of eA)
            usage_by_category_calculator_isPlainObject(ec) &&
              ("input_text" === ec.type || "text" === ec.type) &&
              "string" == typeof ec.text &&
              el.push(ec.text);
          return el.join("");
        }
        return usage_by_category_calculator_isPlainObject(eA) &&
          ("text" === eA.type || "input_text" === eA.type) &&
          "string" == typeof eA.text
          ? eA.text
          : "";
      }
      function collectUserMessageText(eA) {
        if ("string" == typeof eA) return eA;
        if (!Array.isArray(eA)) return "";
        let el = [];
        for (let ec of eA)
          usage_by_category_calculator_isPlainObject(ec) &&
            (("input_text" === ec.type ||
              "text" === ec.type ||
              "output_text" === ec.type) &&
              "string" == typeof ec.text &&
              el.push(ec.text),
            "input_file" === ec.type &&
              "string" == typeof ec.text &&
              el.push(ec.text));
        return el.join("");
      }
      function countImagePieces(eA) {
        let el = 0;
        for (let ec of eA)
          if (
            usage_by_category_calculator_isPlainObject(ec) &&
            "message" === ec.type &&
            "user" === ec.role &&
            Array.isArray(ec.content)
          )
            for (let eA of ec.content)
              usage_by_category_calculator_isPlainObject(eA) &&
                ("input_image" === eA.type || "image" === eA.type) &&
                (el += 1);
        return el;
      }
      function extractFirstHiddenSection(eA) {
        let el = ew.exec(eA);
        if (!el) return;
        let ec = el[1] ?? "",
          eu = eB.exec(ec);
        return eu ? eu[0] : void 0;
      }
      function stripFirstHiddenSection(eA) {
        let el = ew.exec(eA);
        if (!el) return eA;
        let ec = el[1] ?? "",
          eu = eB.exec(ec);
        if (!eu) return eA;
        let ed = ec.slice(0, eu.index) + ec.slice(eu.index + eu[0].length),
          ep = el[0],
          eg = ep.replace(ec, ed);
        return eA.slice(0, el.index) + eg + eA.slice(el.index + ep.length);
      }
      function usage_by_category_calculator_isPlainObject(eA) {
        return "object" == typeof eA && null !== eA && !Array.isArray(eA);
      }
      let e_ = "codebuddy.ai/usageByCategory";
      async function resolveSessionContextSize(eA, el, ec) {
        try {
          let ec = eA.requestOptions.model || eA.options.model,
            eu = await el.getDefault(),
            ed = await el.getModels(eu.name),
            ep =
              (ec ? ed.find((eA) => eA.id === ec) : void 0) ??
              (await el.getModel(eu.name)),
            eg = ep?.maxInputTokens;
          if ("number" == typeof eg && Number.isFinite(eg) && eg > 0) return eg;
          return;
        } catch (el) {
          ec?.warn?.(
            `[UsageUpdateBuilder] resolveContextSize failed for session ${eA.id}: ${el?.message ?? el}`,
          );
          return;
        }
      }
      async function resolveSystemInstructions(eA, el) {
        let ec = eA?.instructions;
        if ("string" == typeof ec) return ec;
        if ("function" == typeof ec) {
          let eu = ec,
            ed = await eu({ context: el }, eA);
          return "string" == typeof ed ? ed : "";
        }
        return "";
      }
      function resolveActiveTools(eA) {
        let el = eA?.tools;
        return Array.isArray(el) ? el : [];
      }
      async function computeSessionUsageByCategory(eA, el, ec, eu) {
        try {
          let eu = await el.getDefault(),
            ed = await resolveSystemInstructions(eu, eA),
            ep = resolveActiveTools(eu);
          return UsageByCategoryCalculator.compute({
            systemPrompt: ed,
            tools: ep,
            history: eA.history,
            totalTokens: ec,
          });
        } catch (el) {
          eu?.warn?.(
            `[UsageUpdateBuilder] compute usageByCategory failed for session ${eA.id}: ${el?.message ?? el}`,
          );
          return;
        }
      }
      async function buildSessionUsageUpdate(eA, el, ec) {
        let ed;
        try {
          ed = eu.UsageUtils.getLatestUsage(eA)?.inputTokens;
        } catch (el) {
          ec?.warn?.(
            `[UsageUpdateBuilder] getLatestUsage failed for session ${eA.id}: ${el?.message ?? el}`,
          );
          return;
        }
        if ("number" != typeof ed || !Number.isFinite(ed) || ed < 0) return;
        let ep = await resolveSessionContextSize(eA, el, ec);
        if (void 0 === ep) return;
        let eg = await computeSessionUsageByCategory(eA, el, ed, ec);
        return { used: ed, size: ep, ...(eg ? { usageByCategory: eg } : {}) };
      }
    },
  };
  const cache = new Map();
  function load(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (id === 68593) return title.originalModule;
    if (id === 18945) return friction.originalModule;
    if (id === 43324) return recall.originalModule;
    if (id === 9151)
      return new Proxy(
        { ProductFeature: load(55114).ProductFeature },
        {
          get(target, key) {
            if (key in target) return target[key];
            throw Error(
              "Explicit product service dependency required: " + String(key),
            );
          },
        },
      );
    if (!factories[id])
      return (
        runtime.getModule?.(id) ??
        new Proxy(
          {},
          {
            get(_target, key) {
              throw Error(
                "Explicit ACP service dependency required: " +
                  id +
                  "." +
                  String(key),
              );
            },
          },
        )
      );
    const module = { exports: {} };
    cache.set(id, module);
    factories[id](module, module.exports, load);
    return module.exports;
  }
  load.r = (exports: any) =>
    Object.defineProperty(exports, "__esModule", { value: true });
  load.d = (exports: any, defs: any) => {
    for (const key of Object.keys(defs))
      if (!Object.hasOwn(exports, key))
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: defs[key],
        });
  };
  const broadcast = (() => {
    const nc = load(67330);
    const nd = load(30638);
    const ne = load(70724);
    const ng = load(7340);
    const nh = load(38548);
    const np = load(12502);
    const r6 = load(80699);
    const r8 = load(22618);
    function buildSubAgentMeta(eA) {
      if (!eA || !ng.SessionUtils.isSubAgent(eA)) return {};
      let el = { [nc.ACP_META_IS_SUB_AGENT]: !0 },
        ec = eA.meta?.parentSessionId;
      return (
        "string" == typeof ec &&
          ec.length > 0 &&
          (el[nc.ACP_META_PARENT_SESSION_ID] = ec),
        el
      );
    }
    let nf = 2e3,
      nm = class {
        constructor() {
          ((this.subscriptions = new Map()),
            (this.sessionsWithFailedBroadcast = new Set()));
        }
        init() {
          this.logger.setContext("AcpBroadcastService");
        }
        startBroadcasting(eA, el, ec) {
          (this.stopBroadcasting(eA.id),
            this.sessionsWithFailedBroadcast.delete(eA.id),
            this.logger.info?.(
              `Starting broadcast for session ${eA.id}, excluding connection ${el}`,
            ));
          let eu = eA.resultSubject.getValue(),
            ed = {},
            ep = eA.combineSubject.subscribe(async (ep) => {
              try {
                await this.broadcastEvent(ep, eA, el, eu, ec, ed);
              } catch (el) {
                this.logger.warn?.(
                  `Broadcast error for session ${eA.id}: ${el}`,
                );
              }
            });
          this.subscriptions.set(eA.id, ep);
        }
        stopBroadcasting(eA) {
          let el = this.subscriptions.get(eA);
          el &&
            (el.unsubscribe(),
            this.subscriptions.delete(eA),
            this.logger.info?.(`Stopped broadcast for session ${eA}`));
        }
        async broadcastInterruptionRequest(eA, el) {
          let ec = el.rawItem,
            eu = ec.callId || ec.id || "",
            ed = String(ec.name || ec.type || "tool"),
            ep = ec.providerData || {},
            eg = np.AcpUtils.parseToRecord(ec.arguments, "arguments");
          "AskUserQuestion" === ed &&
            eg &&
            (eg = (0, nd.normalizeAskUserQuestionInput)(eg));
          let eh = ["allow", "allowAll", "deny"];
          "ExitPlanMode" === ed && eh.push("rejectAndExitPlan");
          let ef = {
              sessionUpdate: "session_info_update",
              _meta: {
                "codebuddy.ai/interruptionRequest": {
                  interruptionId: `ir-${eu}`,
                  toolCallId: eu,
                  toolName: ed,
                  toolTitle: ed,
                  toolInput: eg,
                  options: eh,
                  queuePosition: ep.queuePosition,
                  queueTotal: ep.queueTotal,
                  isSubAgent: ep.isSubAgent,
                  isTeamMember: ep.isTeamMember,
                  memberName: ep.memberName,
                  agentName: ep.agent,
                  agentColor: ep.agentColor,
                  sandboxIntercept:
                    !0 === ep["codebuddy.ai/sandboxIntercept"] || void 0,
                  workflowSourceText:
                    "string" == typeof ep.workflowSourceText
                      ? ep.workflowSourceText
                      : void 0,
                  mcpUiIntercept:
                    !0 === ep["codebuddy.ai/mcpUiIntercept"] || void 0,
                },
              },
            },
            em = this.agentManager.getAll(),
            eE = [];
          for (let [el, ec] of em)
            eE.push(this.sendToConnection(ec, eA, ef, el));
          eE.length > 0 && (await Promise.allSettled(eE));
        }
        async broadcastPermissionResolved(eA, el, ec, eu) {
          let ed = {
              sessionUpdate: "session_info_update",
              _meta: {
                "codebuddy.ai/permissionResolved": !0,
                "codebuddy.ai/toolCallId": el,
                "codebuddy.ai/toolName": ec,
                "codebuddy.ai/decision": eu,
              },
            },
            ep = this.agentManager.getAll(),
            eg = [];
          for (let [el, ec] of ep)
            eg.push(this.sendToConnection(ec, eA, ed, el));
          eg.length > 0 && (await Promise.allSettled(eg));
        }
        async broadcastMcpProgress(eA, el, ec, eu) {
          let ed = {
              sessionUpdate: "tool_call_update",
              toolCallId: el,
              _meta: {
                "codebuddy.ai": {
                  toolName: ec,
                  toolMetaData: { mcpProgress: eu },
                },
              },
            },
            ep = this.agentManager.getAll(),
            eg = [];
          for (let [el, ec] of ep)
            eg.push(this.sendToConnection(ec, eA, ed, el));
          eg.length > 0 && (await Promise.allSettled(eg));
        }
        async broadcastMcpUi(eA, el, ec, eu) {
          let ed = {
              sessionUpdate: "tool_call_update",
              toolCallId: el,
              _meta: {
                "codebuddy.ai": { toolName: ec, toolMetaData: { mcpUi: eu } },
              },
            },
            ep = this.agentManager.getAll(),
            eg = [];
          for (let [el, ec] of ep)
            eg.push(this.sendToConnection(ec, eA, ed, el));
          eg.length > 0 && (await Promise.allSettled(eg));
        }
        async broadcastToolCallFailedForSession(eA, el) {
          if (this.sessionsWithFailedBroadcast.has(eA))
            return void this.logger.debug?.(
              `[AcpBroadcastService] broadcastToolCallFailedForSession: already broadcasted, skip sessionId=${eA}`,
            );
          this.sessionsWithFailedBroadcast.add(eA);
          let ec = this.agentManager.getAll(),
            eu = new Set();
          for (let [, el] of ec)
            for (let ec of el.listPendingToolCallIds(eA)) eu.add(ec);
          if (
            (this.logger.info?.(
              `[AcpBroadcastService] broadcastToolCallFailedForSession: sessionId=${eA}, pendingCount=${eu.size}`,
            ),
            0 === eu.size)
          )
            return;
          let ed = [];
          for (let ep of eu) {
            let eu = {
              sessionUpdate: "tool_call_update",
              toolCallId: ep,
              status: "failed",
              content: [
                { type: "content", content: { type: "text", text: el } },
              ],
              _meta: { "codebuddy.ai/terminationReason": "prompt_timeout" },
            };
            for (let [el, ep] of ec)
              ed.push(this.sendToConnection(ep, eA, eu, el));
          }
          (ed.length > 0 && (await Promise.allSettled(ed)),
            this.logger.info?.(
              `[AcpBroadcastService] broadcastToolCallFailedForSession: done, sessionId=${eA}, broadcastedToolCalls=${eu.size}, connections=${ec.size}`,
            ));
        }
        async broadcastMessageQueueUpdate(eA, el) {
          let ec = {
              sessionUpdate: "session_info_update",
              _meta: { "codebuddy.ai/message_queue_update": el },
            },
            eu = this.agentManager.getAll(),
            ed = [];
          for (let [el, ep] of eu)
            ed.push(this.sendToConnection(ep, eA, ec, el));
          ed.length > 0 && (await Promise.allSettled(ed));
        }
        async broadcastGoalRecap(eA, el) {
          let ec = {
              sessionUpdate: "session_info_update",
              _meta: { "codebuddy.ai/goalRecap": el },
            },
            eu = this.agentManager.getAll(),
            ed = [];
          for (let [el, ep] of eu)
            ed.push(this.sendToConnection(ep, eA, ec, el));
          (ed.length > 0 && (await Promise.allSettled(ed)),
            this.logger.info?.(
              `[AcpBroadcastService] broadcastGoalRecap: sessionId=${eA}, connections=${eu.size}, hasActive=${!!el.active}, hasLatest=${!!el.latest}`,
            ));
        }
        async broadcastCompactCancelled(eA) {
          let el = {
              sessionUpdate: "session_info_update",
              _meta: { [nc.ACP_META_COMPACT_CANCELLED]: { cancelled: !0 } },
            },
            ec = this.agentManager.getAll(),
            eu = [];
          for (let [ed, ep] of ec)
            eu.push(this.sendToConnection(ep, eA, el, ed));
          (eu.length > 0 && (await Promise.allSettled(eu)),
            this.logger.info?.(
              `[AcpBroadcastService] broadcastCompactCancelled: sessionId=${eA}, connections=${ec.size}`,
            ));
        }
        async broadcastCompactLimitReached(eA) {
          let el = {
              sessionUpdate: "session_info_update",
              _meta: {
                [nc.ACP_META_COMPACT_LIMIT_REACHED]: { limitReached: !0 },
              },
            },
            ec = this.agentManager.getAll(),
            eu = [];
          for (let [ed, ep] of ec)
            eu.push(this.sendToConnection(ep, eA, el, ed));
          (eu.length > 0 && (await Promise.allSettled(eu)),
            this.logger.info?.(
              `[AcpBroadcastService] broadcastCompactLimitReached: sessionId=${eA}, connections=${ec.size}`,
            ));
        }
        async broadcastCompactStarted(eA, el, ec) {
          let eu = `compact-maxtoken-${eA}-${Date.now()}`,
            ed = {
              sessionUpdate: "agent_message_chunk",
              messageId: eu,
              content: [
                {
                  type: "text",
                  text: "<conversation_history_summary><summary>",
                },
              ],
              _meta: {
                "codebuddy.ai/isCompactInternal": !0,
                "codebuddy.ai": { messageId: eu },
                ...(el ? { [nc.ACP_META_COMPACT_TYPE]: el } : {}),
                ...buildSubAgentMeta(ec),
              },
            },
            ep = this.agentManager.getAll(),
            eg = [];
          for (let [el, ec] of ep)
            eg.push(this.sendToConnection(ec, eA, ed, el));
          return (
            eg.length > 0 && (await Promise.allSettled(eg)),
            this.logger.info?.(
              `[AcpBroadcastService] broadcastCompactStarted: sessionId=${eA}, messageId=${eu}, connections=${ep.size}`,
            ),
            eu
          );
        }
        async broadcastCompactCompleted(eA, el, ec, eu, ed) {
          let ep = {
              sessionUpdate: "agent_message_chunk",
              messageId: ec,
              content: [
                {
                  type: "text",
                  text: `<conversation_history_summary><summary>${el}</summary></conversation_history_summary>`,
                },
              ],
              _meta: {
                "codebuddy.ai/isCompactInternal": !0,
                "codebuddy.ai": { messageId: ec },
                ...(eu ? { [nc.ACP_META_COMPACT_TYPE]: eu } : {}),
                ...buildSubAgentMeta(ed),
              },
            },
            eg = this.agentManager.getAll(),
            eh = [];
          for (let [el, ec] of eg)
            eh.push(this.sendToConnection(ec, eA, ep, el));
          (eh.length > 0 && (await Promise.allSettled(eh)),
            this.logger.info?.(
              `[AcpBroadcastService] broadcastCompactCompleted: sessionId=${eA}, messageId=${ec}, connections=${eg.size}`,
            ));
        }
        dispose() {
          for (let [eA, el] of this.subscriptions)
            (el.unsubscribe(),
              this.logger.info?.(`Disposed broadcast for session ${eA}`));
          (this.subscriptions.clear(),
            this.sessionsWithFailedBroadcast.clear());
        }
        async broadcastUserMessage(eA, el, ec, eu, ed, ep, eg) {
          let eh = {
            sessionUpdate: "user_message_chunk",
            content: { type: "text", text: el },
          };
          (this.injectTrackingMeta(eh, ep, ed, eg),
            eu &&
              eu.length > 0 &&
              (eh._meta = { ...(eh._meta || {}), "codebuddy.ai/images": eu }));
          let ef = this.agentManager.getAll(),
            em = [];
          for (let [el, eu] of ef)
            el !== ec && em.push(this.sendToConnection(eu, eA, eh, el));
          em.length > 0 && (await Promise.allSettled(em));
        }
        async broadcastSessionEnd(eA, el, ec, eu, ed = "end_turn") {
          if (ec) {
            let eA = this.stateMachine.getSnapshot(ec).status;
            if (!this.shouldBroadcastSessionEnd(ec))
              return void this.logger.debug?.(
                `[AcpBroadcastService] suppress session_end: session not idle (sessionId=${ec.id}, status=${eA}, isCompressing=${ec.isCompressing})`,
              );
            if (
              (await new Promise((eA) => setTimeout(eA, 0)),
              !this.shouldBroadcastSessionEnd(ec))
            )
              return void this.logger.debug?.(
                `[AcpBroadcastService] suppress session_end after idle recheck: session not idle (sessionId=${ec.id}, status=${this.stateMachine.getSnapshot(ec).status}, isCompressing=${ec.isCompressing})`,
              );
          }
          let ep = (0, nh.buildAcpSessionEndUpdate)(
              ec?.conversationRequestId,
              eu,
              ed,
            ),
            eg = this.agentManager.getAll(),
            eh = [];
          for (let [ec, eu] of eg)
            ec !== el && eh.push(this.sendToConnection(eu, eA, ep, ec, !1));
          eh.length > 0 && (await Promise.allSettled(eh));
        }
        shouldBroadcastSessionEnd(eA) {
          return (
            !(
              eA.isCompressing ||
              eA.meta?.[nc.SESSION_META_COMPACT_EXPECTS_CONTINUE] ||
              eA.meta?.[nc.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS]
            ) && this.stateMachine.isIdle(eA)
          );
        }
        async broadcastCheckpoint(eA, el, ec) {
          let eu = this.agentManager.getAll(),
            ed = [];
          for (let [ep, eg] of eu)
            ed.push(
              (async () => {
                try {
                  let eu = eg.getConnection(),
                    ed = this.isDetailedCheckpointConsumer(eg, eA)
                      ? ec
                      : this.toLightweightCheckpointInfo(ec);
                  await eu.extNotification(ne.ExtensionMethod.CHECKPOINT, {
                    sessionId: eA,
                    event: el,
                    checkpoint: ed,
                  });
                } catch (eA) {
                  this.logger.warn?.(
                    `Failed to send checkpoint notification to ${ep}: ${eA}`,
                  );
                }
              })(),
            );
          ed.length > 0 && (await Promise.allSettled(ed));
        }
        hasDetailedCheckpointConsumer(eA) {
          for (let [, el] of this.agentManager.getAll())
            if (this.isDetailedCheckpointConsumer(el, eA)) return !0;
          return !1;
        }
        async broadcastEvent(eA, el, ec, eu, ed, ep) {
          if ("result" === eA.type || "interrupt_result" === eA.type) return;
          ep &&
            "model" === eA.type &&
            !eA.parentToolUseId &&
            eA.data?.type === "response_started" &&
            (ep.messageId = el.messageId);
          let eg = !1;
          for (let eA of this.agentManager.getAll().keys())
            if (eA !== ec) {
              eg = !0;
              break;
            }
          if (!eg) return;
          let eh = [],
            ef = (0, nh.getAcpItemTimestamp)(eA.data);
          if ("input" === eA.type) {
            if (
              "function_call" === eA.data.type ||
              "function_call_result" === eA.data.type ||
              "function_call_output" === eA.data.type
            ) {
              let el = r6.ContainerUtil.get(
                  r8.AcpToolInterceptor,
                ).getFileContentCache(),
                ec = np.AcpUtils.convertInputItemToAcp(eA.data, el, {
                  parentToolUseId: eA.parentToolUseId,
                });
              ec && eh.push(ec);
            }
          } else if ("model" === eA.type) {
            let ec = np.AcpUtils.convertOpenAIEventToAcp(eA.data).filter(
                (eA) => !np.AcpUtils.isInternalStreamingUpdate(eA),
              ),
              eu = {};
            if (
              (eA.parentToolUseId &&
                (eu["codebuddy.ai/parentToolCallId"] = eA.parentToolUseId),
              el.isCompressing &&
                !el.meta?.[nc.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS])
            ) {
              eu["codebuddy.ai/isCompactInternal"] = !0;
              let eA = el.meta?.[nc.SESSION_META_COMPACT_TYPE];
              eA && (eu[nc.ACP_META_COMPACT_TYPE] = eA);
            }
            for (let eA of ec)
              (Object.keys(eu).length > 0 &&
                (eA._meta = { ...(eA._meta || {}), ...eu }),
                eh.push(eA));
          }
          if (0 === eh.length) return;
          let em = ep?.messageId;
          for (let eA of eh) this.injectTrackingMeta(eA, el, ed, ef, em);
          let eE = this.agentManager.getAll();
          for (let eA of eh) {
            let eu = [];
            for (let [ed, ep] of eE)
              ed !== ec && eu.push(this.sendToConnection(ep, el.id, eA, ed));
            eu.length > 0 && (await Promise.allSettled(eu));
          }
        }
        toLightweightCheckpointInfo(eA) {
          return {
            ...eA,
            fileChanges: {
              ...eA.fileChanges,
              files: eA.fileChanges.files.map((eA) => ({
                uri: eA.uri,
                changeType: eA.changeType,
              })),
            },
          };
        }
        isDetailedCheckpointConsumer(eA, el) {
          if (eA.getCurrentSessionId() !== el) return !1;
          let ec = eA.getClientCapabilities()?._meta,
            eu = ec?.["workbuddy.desktop"];
          return eu?.detailedCheckpoint === !0;
        }
        injectTrackingMeta(eA, el, ec, eu, ed) {
          if (!eA) return;
          let ep = { ...(eA._meta || {}) },
            eg =
              "string" == typeof eA.sessionUpdate ? eA.sessionUpdate : void 0,
            eh =
              "agent_message_chunk" === eg ||
              "agent_thought_chunk" === eg ||
              "tool_call" === eg ||
              "tool_call_update" === eg,
            ef = !0 === ep["codebuddy.ai/isCompactInternal"],
            em = el?.conversationRequestId || ec?.requestId,
            eE = ef ? void 0 : ec?.messageId,
            eC = eh ? (0, nc.withCompactGeneration)(eE, el) : eE,
            ey = eC || ed || el?.messageId,
            ew = ec?.messageRequestId || em,
            eB = eh && !!eC;
          (em &&
            !ep["codebuddy.ai/requestId"] &&
            (ep["codebuddy.ai/requestId"] = em),
            ey && eB
              ? (ep["codebuddy.ai/messageId"] = ey)
              : ey &&
                !ep["codebuddy.ai/messageId"] &&
                (ep["codebuddy.ai/messageId"] = ey),
            ew &&
              !ep["codebuddy.ai/messageRequestId"] &&
              (ep["codebuddy.ai/messageRequestId"] = ew),
            (eA._meta = ep),
            "user_message_chunk" === eA.sessionUpdate && ew && !eA.messageId
              ? (eA.messageId = ew)
              : eB && ey
                ? (eA.messageId = ey)
                : !eA.messageId &&
                  ("user_message_chunk" === eA.sessionUpdate && ew
                    ? (eA.messageId = ew)
                    : ("agent_message_chunk" === eA.sessionUpdate ||
                        "agent_thought_chunk" === eA.sessionUpdate) &&
                      ey &&
                      (eA.messageId = ey)),
            Object.assign(eA, (0, nh.withAcpTimestampMeta)(eA, eu)));
        }
        async sendToConnection(eA, el, ec, eu, ed = !0) {
          let ep;
          try {
            let eu = eA.getConnection(),
              eg = new Promise((eA, el) => {
                ep = setTimeout(() => {
                  el(Error(`broadcast send timeout after ${nf}ms`));
                }, nf);
              }),
              eh = ed ? (0, nh.withAcpTimestampMeta)(ec) : ec;
            await Promise.race([
              eu.sessionUpdate({ sessionId: el, update: eh }),
              eg,
            ]);
          } catch (eA) {
            this.logger.debug?.(
              `Failed to broadcast to connection ${eu}: ${eA}`,
            );
          } finally {
            void 0 !== ep && clearTimeout(ep);
          }
        }
      };
    const originalModule = {};
    const result = {
      ...originalModule,
      AcpBroadcastServiceImpl: nm,
      buildSubAgentMeta,
    };
    Object.defineProperty(result, "originalModule", { value: originalModule });
    return result;
  })();
  const usage = (() => {
    const im = load(82263);
    const nB = load(93039);
    const r8 = load(22618);
    let iE = 250,
      iC = "codebuddy.ai/requestId",
      iy = "codebuddy.ai/messageId",
      iw = class {
        constructor() {
          this.states = new Map();
        }
        init() {
          this.logger.setContext("AcpUsagePublisher");
        }
        register(eA, el) {
          this.unregister(eA.id);
          let ec = {
              session: eA,
              connection: el,
              lastUsed: -1,
              lastSize: -1,
              streamTimer: null,
              subscriptions: [],
              warnedSizeMissing: !1,
              lastCost: -1,
              lastMessageId: void 0,
              lastUsageByCategoryHash: void 0,
              teamCreditStageIds: new Set(),
              snapshotRequestId: eA.conversationRequestId,
            },
            eu = eA.combineSubject.subscribe({
              next: (el) => {
                "input" !== el.type ||
                  el.parentToolUseId ||
                  ((ec.snapshotRequestId = eA.conversationRequestId),
                  this.scheduleStreamPublish(eA.id));
              },
              error: (el) => {
                this.logger.warn?.(
                  `combineSubject error for session ${eA.id}: ${el?.message ?? el}`,
                );
              },
            });
          ec.subscriptions.push(eu);
          let ed = eA.inputSubject.subscribe({
            next: (el) => {
              el?._fromSubAgent && this.handleSubAgentCreditItem(eA.id, el);
            },
          });
          (ec.subscriptions.push(ed), this.states.set(eA.id, ec));
        }
        unregister(eA) {
          let el = this.states.get(eA);
          if (el) {
            for (let ec of (el.streamTimer &&
              (clearTimeout(el.streamTimer), (el.streamTimer = null)),
            el.subscriptions))
              try {
                ec.unsubscribe();
              } catch (el) {
                this.logger.debug?.(
                  `unsubscribe failed for session ${eA}: ${el?.message ?? el}`,
                );
              }
            ((el.subscriptions.length = 0), this.states.delete(eA));
          }
        }
        async publish(eA, el) {
          let ec = this.states.get(eA);
          ec &&
            (ec.streamTimer &&
              "stream" !== el &&
              (clearTimeout(ec.streamTimer), (ec.streamTimer = null)),
            "stream" !== el &&
              (ec.snapshotRequestId = ec.session.conversationRequestId),
            await this.doPublish(ec, el));
        }
        dispose() {
          for (let eA of [...this.states.keys()]) this.unregister(eA);
        }
        async publishTeamMemberCredit(eA) {
          let {
              leaderSessionId: el,
              leaderRequestId: ec,
              leaderMessageId: eu,
              credit: ed,
              stageId: ep,
            } = eA,
            eg = this.states.get(el);
          if (!eg || eg.teamCreditStageIds.has(ep)) return;
          eg.teamCreditStageIds.add(ep);
          let eh = { [iC]: ec };
          eu && (eh[iy] = eu);
          try {
            (await this.sendSessionUpdate(eg, {
              used: 0,
              size: 0,
              cost: { amount: ed, currency: "" },
              meta: eh,
            }),
              this.logCreditConsumed({
                sessionId: el,
                requestId: ec,
                messageId: eu,
                credit: ed,
                source: "team_member",
                stageId: ep,
              }));
          } catch (eA) {
            this.logger.warn?.(
              `[AcpUsagePublisher] publishTeamMemberCredit failed (stageId=${ep}): ${eA?.message ?? eA}`,
            );
          }
        }
        handleSubAgentCreditItem(eA, el) {
          let ec = el?.providerData;
          if (!ec) return;
          let eu = ec.rawUsage ?? ec.usage,
            ed =
              "number" == typeof eu?.credit &&
              Number.isFinite(eu.credit) &&
              eu.credit > 0
                ? eu.credit
                : void 0;
          if (!ed) return;
          let ep = this.states.get(eA);
          if (!ep) return;
          let { session: eg } = ep,
            eh =
              getRootRequestId(eg) ??
              ep.snapshotRequestId ??
              eg.conversationRequestId;
          if (!eh) return;
          let ef = `team:${el.id ?? Date.now()}`;
          this.publishTeamMemberCredit({
            leaderSessionId: eA,
            leaderRequestId: eh,
            leaderMessageId: eg.messageId,
            credit: ed,
            stageId: ef,
          }).catch(() => {});
        }
        scheduleStreamPublish(eA) {
          let el = this.states.get(eA);
          !el ||
            el.streamTimer ||
            (el.streamTimer = setTimeout(() => {
              el.streamTimer = null;
              let ec = this.states.get(eA);
              ec && this.doPublish(ec, "stream").catch(() => {});
            }, iE));
        }
        async doPublish(eA, el) {
          let ec,
            eu,
            ed,
            { session: ep } = eA;
          try {
            eu = nB.UsageUtils.getLatestUsage(ep)?.inputTokens;
          } catch (eA) {
            (this.logger.warn?.(
              `getLatestUsage failed for session ${ep.id} (source=${el}): ${eA?.message ?? eA}`,
            ),
              (eu = void 0));
          }
          if ("number" == typeof eu && eu >= 0) ec = eu;
          else {
            if (eA.lastUsed > 0)
              return void this.logger.debug?.(
                `skip usage_update for session ${ep.id} (source=${el}): no fresh usage from getLatestUsage; keeping last used=${eA.lastUsed}`,
              );
            ec = 0;
          }
          let eg = await (0, im.resolveSessionContextSize)(
            ep,
            this.agentManager,
            this.logger,
          );
          if (void 0 === eg) {
            eA.warnedSizeMissing ||
              ((eA.warnedSizeMissing = !0),
              this.logger.warn?.(
                `session ${ep.id} (source=${el}): skip usage_update — model.maxInputTokens unavailable`,
              ));
            return;
          }
          let eh = this.tryBuildUsageDetail(ep),
            ef = eh?.cost ?? 0,
            em = eh?.messageId ?? ep.messageId,
            eE = ef >= 0 && (ef !== eA.lastCost || em !== eA.lastMessageId);
          r8.ACP_USAGE_CATEGORY_SNAPSHOT_SOURCES.has(el) &&
            (ed = await (0, im.computeSessionUsageByCategory)(
              ep,
              this.agentManager,
              ec,
              this.logger,
            ));
          let eC = ed ? JSON.stringify(ed) : void 0,
            ey = void 0 !== eC && eC !== eA.lastUsageByCategoryHash;
          if (eA.lastUsed === ec && eA.lastSize === eg && !eE && !ey) return;
          let ew =
              getRootRequestId(ep) ??
              eA.snapshotRequestId ??
              ep.conversationRequestId,
            eB = em,
            e_ = {};
          (ew && (e_[iC] = ew),
            eB && (e_[iy] = eB),
            eh && (e_.usage = eh.usage),
            ed && (e_[im.META_KEY_CONTEXT_USAGE_BY_CATEGORY] = ed));
          let eI = ef > 0 && eE ? { amount: ef, currency: "" } : void 0;
          try {
            (await this.sendSessionUpdate(eA, {
              used: ec,
              size: eg,
              cost: eI,
              meta: e_,
            }),
              eI &&
                this.logCreditConsumed({
                  sessionId: ep.id,
                  requestId: ew,
                  messageId: eB,
                  credit: eI.amount,
                  source: el,
                }),
              (eA.lastUsed = ec),
              (eA.lastSize = eg),
              ef >= 0 && ((eA.lastCost = ef), (eA.lastMessageId = em)),
              void 0 !== eC && (eA.lastUsageByCategoryHash = eC));
          } catch (eA) {
            this.logger.warn?.(
              `sessionUpdate(usage_update) failed for session ${ep.id} (source=${el}, used=${ec}, size=${eg}): ${eA?.message ?? eA}`,
            );
          }
        }
        logCreditConsumed(eA) {
          let {
              sessionId: el,
              requestId: ec,
              messageId: eu,
              credit: ed,
              source: ep,
              stageId: eg,
            } = eA,
            eh = eu ? ` messageId=${eu}` : "",
            ef = eg ? ` stageId=${eg}` : "";
          this.logger.info?.(
            `[AcpUsagePublisher] credit consumed source=${ep} sessionId=${el} requestId=${ec ?? "unknown"}${eh}${ef} credit=${ed}`,
          );
        }
        async sendSessionUpdate(eA, el) {
          let { used: ec, size: eu, cost: ed, meta: ep } = el,
            eg = { sessionUpdate: "usage_update" };
          (void 0 !== ec && (eg.used = ec),
            void 0 !== eu && (eg.size = eu),
            ed && (eg.cost = ed),
            ep && Object.keys(ep).length > 0 && (eg._meta = ep),
            await eA.connection.sessionUpdate({
              sessionId: eA.session.id,
              update: eg,
            }));
        }
        tryBuildUsageDetail(eA) {
          let el = nB.HistoryUtils.getActiveAgentOnlyHistory(eA.history),
            ec = el.length > 0 ? el : eA.history;
          for (let eA = ec.length - 1; eA >= 0; eA--) {
            let el = ec[eA],
              eu = el?.providerData;
            if (!eu) continue;
            let ed = eu.rawUsage ?? eu.usage;
            if (!ed) continue;
            let ep = toFiniteNumber(ed.credit);
            return {
              usage: ed,
              cost: ep,
              messageId:
                "string" == typeof eu.messageId ? eu.messageId : void 0,
            };
          }
        }
      };
    function getRootRequestId(eA) {
      let el = eA.meta?.rootRequestId;
      return "string" == typeof el && el ? el : void 0;
    }
    function toFiniteNumber(eA) {
      return "number" == typeof eA && Number.isFinite(eA) && eA >= 0 ? eA : 0;
    }
    const originalModule = {};
    const result = {
      ...originalModule,
      AcpUsagePublisherImpl: iw,
      getRootRequestId,
      toFiniteNumber,
    };
    Object.defineProperty(result, "originalModule", { value: originalModule });
    return result;
  })();
  const title = (() => {
    const eB = load(76884);
    const eC = load(51147);
    const ef = load(76586);
    const em = load(20881);
    const ew = load(66545);
    let eS = 2,
      eQ = 3,
      eD = 15e3,
      eT = class {
        constructor() {
          ((this.sessionStates = new Map()),
            (this.pendingTitlePromises = new Map()),
            (this.forceEnabled = !1));
        }
        get disabled() {
          return !!eC.BooleanUtils.isTruthy(
            process.env.CODEBUDDY_CODE_DISABLE_TERMINAL_TITLE,
          );
        }
        init() {
          this.logger.setContext("SessionTitleService");
        }
        setForceEnabled(eA) {
          this.forceEnabled = eA;
        }
        getPendingTitlePromise(eA) {
          return this.pendingTitlePromises.get(eA);
        }
        async handleUserPromptSubmit(eA, el) {
          if (this.disabled || !this.shouldProcessPrompt(eA)) return;
          let ec = this.getOrCreateState(el);
          if (ec.titled || ec.abandoned) return;
          if ((0, em.hasCustomTitle)(el.history)) {
            ec.titled = !0;
            return;
          }
          let eu = (0, em.getFirstUsableUserMessageText)(el.history, eS);
          if (!eu) return;
          let ed = ++ec.generationId,
            ep = this.generateAndPersistTitle(el, eu, ed);
          (this.pendingTitlePromises.set(el.id, ep),
            ep.finally(() => {
              this.pendingTitlePromises.get(el.id) === ep &&
                this.pendingTitlePromises.delete(el.id);
            }),
            await ep);
        }
        shouldProcessPrompt(eA) {
          return (
            !(
              !eA ||
              "string" != typeof eA ||
              eA.startsWith(`<${eB.CommandXmlTags.LOCAL_COMMAND_STDOUT}>`) ||
              /^<system-reminder[\s>]/.test(eA.trim())
            ) &&
            (!!this.forceEnabled || !!process.stdout.isTTY)
          );
        }
        getOrCreateState(eA) {
          let el = this.sessionStates.get(eA.id);
          return (
            el ||
              ((el = this.createStateFromHistory(eA)),
              this.sessionStates.set(eA.id, el)),
            el
          );
        }
        createStateFromHistory(eA) {
          return {
            titled: (0, em.hasGeneratedTitle)(eA.history),
            failedAttempts: 0,
            generationId: 0,
            abandoned: !1,
          };
        }
        async generateAndPersistTitle(eA, el, ec) {
          let eu = null;
          try {
            eu = await this.runGenerationWithTimeout(el);
          } catch (eA) {
            (this.logger.error(`Failed to generate session title: ${eA}`),
              (eu = null));
          }
          let ed = this.sessionStates.get(eA.id);
          if (ed && ed.generationId === ec) {
            if (!eu) return void this.recordFailure(ed);
            if ((0, em.hasCustomTitle)(eA.history)) {
              ed.titled = !0;
              return;
            }
            try {
              await this.sessionManager.addHistory(eA, [
                { type: "ai-title", aiTitle: eu, sessionId: eA.id },
              ]);
            } catch (eA) {
              (this.logger.error(`Failed to persist session title: ${eA}`),
                this.recordFailure(ed));
              return;
            }
            ((ed.titled = !0),
              (ed.failedAttempts = 0),
              this.terminalTitleUpdater?.update(eu),
              this.reportGenerated(!0));
          }
        }
        recordFailure(eA) {
          ((eA.failedAttempts += 1),
            eA.failedAttempts >= eQ && (eA.abandoned = !0),
            this.reportGenerated(!1));
        }
        reportGenerated(eA) {
          try {
            this.galileoService?.addCounter("wb.session_title_generated", 1, {
              success: String(eA),
            });
          } catch {}
        }
        async runGenerationWithTimeout(eA) {
          let el,
            ec = `<session>
${eA}
</session>`,
            eu = new Promise((eA) => {
              (el = setTimeout(() => eA(null), eD)) &&
                "function" == typeof el.unref &&
                el.unref();
            });
          try {
            let eA = await Promise.race([
              this.agentService.runOneTime(
                ew.AgentNames.TERMINAL_TITLE_GENERATOR,
                ec,
              ),
              eu,
            ]);
            if (null === eA)
              return (
                this.logger.warn(
                  `Session title generation timed out after ${eD}ms`,
                ),
                null
              );
            return this.parseResponse(eA);
          } finally {
            el && clearTimeout(el);
          }
        }
        parseResponse(eA) {
          let el = eA.trim();
          if (!el) return null;
          try {
            let eA = JSON.parse(el);
            return this.extractTitleFromParsedResponse(eA);
          } catch (ec) {
            let eA = this.extractJsonFromResponse(el);
            if (eA) return this.extractTitleFromParsedResponse(eA);
            return (
              this.logger.warn(
                `Invalid title JSON response: ${ec.message}; length=${el.length}; sample=${el.slice(0, 200)}`,
              ),
              null
            );
          }
        }
        extractTitleFromParsedResponse(eA) {
          if (!eA || "object" != typeof eA || !("title" in eA)) return null;
          let el = eA.title;
          return ("string" == typeof el && el.trim()) || null;
        }
        extractJsonFromResponse(eA) {
          try {
            let el = eA.match(/\{[^}]*"title"[^}]*\}/g);
            if (!el) return null;
            for (let eA of el)
              try {
                let el = JSON.parse(eA);
                if (el && "object" == typeof el && "title" in el) return el;
              } catch {
                continue;
              }
          } catch {}
          return null;
        }
      };
    const originalModule = {};
    Object.defineProperty(originalModule, "__esModule", { value: true });
    Object.defineProperty(originalModule, "SessionTitleServiceImpl", {
      enumerable: true,
      get: () => eT,
    });
    Object.defineProperty(originalModule, "SessionTitleService", {
      enumerable: true,
      get: () => ef.SessionTitleService,
    });
    Object.defineProperty(originalModule, "getFirstRealUserMessageText", {
      enumerable: true,
      get: () => em.getFirstRealUserMessageText,
    });
    Object.defineProperty(originalModule, "hasCustomTitle", {
      enumerable: true,
      get: () => em.hasCustomTitle,
    });
    Object.defineProperty(originalModule, "hasGeneratedTitle", {
      enumerable: true,
      get: () => em.hasGeneratedTitle,
    });
    Object.defineProperty(originalModule, "getEffectiveSessionTitle", {
      enumerable: true,
      get: () => em.getEffectiveSessionTitle,
    });
    Object.defineProperty(originalModule, "getFirstUsableUserMessageText", {
      enumerable: true,
      get: () => em.getFirstUsableUserMessageText,
    });
    const result = { ...originalModule, SessionTitleServiceImpl: eT };
    Object.defineProperty(result, "originalModule", { value: originalModule });
    return result;
  })();
  const friction = (() => {
    const eC = load(82485);
    const ef = load(70724);
    let ew = Symbol("FrictionAnalysisService"),
      eB = "chat_prompt_friction_analysis";
    function normalizePromptText(eA) {
      return (0, ef.stripUserQueryXml)(eA).replace(/\s+/g, " ").trim();
    }
    function readTextValue(eA) {
      let el = eA.text;
      if ("string" == typeof el) return el;
      let ec = eA.content;
      if ("string" == typeof ec) return ec;
    }
    function extractVisibleUserPromptFromAcpPrompt(eA) {
      if (!Array.isArray(eA)) return "";
      let el = [];
      for (let ec of eA) {
        if (!ec || "object" != typeof ec) continue;
        let eA = ec;
        if ("text" !== eA.type) continue;
        let eu = readTextValue(eA);
        eu && el.push(eu);
      }
      return normalizePromptText(el.join("\n"));
    }
    function extractTextFromInputContent(eA) {
      if ("string" == typeof eA) return [eA];
      if (!Array.isArray(eA)) return [];
      let el = [];
      for (let ec of eA) {
        if (!ec || "object" != typeof ec) continue;
        let eA = ec;
        if ("input_text" !== eA.type && "text" !== eA.type) continue;
        let eu = readTextValue(eA);
        eu && el.push(eu);
      }
      return el;
    }
    function extractVisibleUserPromptFromAgentInput(eA) {
      if ("string" == typeof eA) return normalizePromptText(eA);
      let el = [];
      for (let ec of Array.isArray(eA)
        ? eA
        : eA && "object" == typeof eA && Array.isArray(eA.history)
          ? eA.history
          : []) {
        if (!ec || "object" != typeof ec) continue;
        let eA = ec;
        "message" === eA.type &&
          "user" === eA.role &&
          el.push(...extractTextFromInputContent(eA.content));
      }
      return normalizePromptText(el.join("\n"));
    }
    function buildFrictionTelemetryPayload(eA, el, ec, eu, ed, ep) {
      let eg = el.requestId;
      return {
        conversationId: el.conversationId || eA.id,
        requestId: eg,
        requestModelId: el.requestModelId,
        requestModelName: el.requestModelName,
        presentAt: el.presentAt ?? Date.now(),
        userPrompt: ec,
        ...(ed ? { linkedPreviousRequestId: ed } : {}),
        frictionType: eu.frictionType,
        severity: eu.severity,
        evidenceText: eu.evidenceText,
        ...(ep ? { linkedExecutionSignal: ep } : {}),
        rootCauseCandidate: eu.rootCauseCandidate,
      };
    }
    let e_ = class {
      constructor() {
        ((this.pendingPromptBySession = new Map()),
          (this.pendingAnalysisByRequest = new Map()),
          (this.reportedKeys = new Set()));
      }
      capturePrompt(eA, el) {
        let ec = normalizePromptText(el);
        if (!eA.id || !ec) return;
        if (!eA.conversationRequestId)
          return void this.pendingPromptBySession.set(eA.id, ec);
        let eu = this.getRequestKey(eA);
        if (
          !eu ||
          this.pendingAnalysisByRequest.has(eu) ||
          this.reportedKeys.has(eu)
        )
          return;
        let ed = this.pendingPromptBySession.get(eA.id) || ec;
        (this.pendingPromptBySession.delete(eA.id),
          ed &&
            this.pendingAnalysisByRequest.set(eu, {
              userPrompt: ed,
              analysisPromise: this.frictionRecallClient.recall(ed),
              linkedPreviousRequestId: this.extractLinkedPreviousRequestId(eA),
              linkedExecutionSignal: this.extractLinkedExecutionSignal(eA),
            }));
      }
      tryReportOnRequestSend(eA, el) {
        let ec = this.getRequestKey(eA);
        if (!ec || this.reportedKeys.has(ec)) return;
        let eu = this.pendingAnalysisByRequest.get(ec);
        eu &&
          !eu.flushStarted &&
          el.requestId &&
          ((eu.requestTelemetry = el),
          (eu.flushStarted = !0),
          this.flushPending(eA, ec, eu).catch((eA) => {
            this.logger.warn(
              "Failed to flush prompt friction analysis telemetry:",
              eA,
            );
          }));
      }
      async flushPending(eA, el, ec) {
        if (this.reportedKeys.has(el) || !ec.requestTelemetry?.requestId)
          return;
        let eu = await ec.analysisPromise;
        if (
          this.reportedKeys.has(el) ||
          !eu ||
          !(await this.isFeatureEnabledForReport())
        )
          return void this.pendingAnalysisByRequest.delete(el);
        let ed = buildFrictionTelemetryPayload(
          eA,
          ec.requestTelemetry,
          ec.userPrompt,
          eu,
          ec.linkedPreviousRequestId,
          ec.linkedExecutionSignal,
        );
        (this.reportedKeys.add(el), this.pendingAnalysisByRequest.delete(el));
        try {
          await this.eventService.report(eB, ed);
        } catch (eA) {
          this.logger.warn(
            "Failed to report chat_prompt_friction_analysis telemetry:",
            eA,
          );
        }
      }
      async isFeatureEnabledForReport() {
        try {
          let eA = await this.productManager.waitConfiguration(),
            el = (0, eC.isChatPromptFrictionAnalysisEnabled)(
              eA.productFeatures,
            );
          return (
            this.logger.info(`[FrictionAnalysis] Report gate enabled=${el}`),
            el
          );
        } catch (eA) {
          return (
            this.logger.warn(
              "Failed to resolve chat prompt friction analysis product feature:",
              eA,
            ),
            !1
          );
        }
      }
      getRequestKey(eA) {
        if (eA.id && eA.conversationRequestId)
          return `${eA.id}:${eA.conversationRequestId}`;
      }
      extractLinkedPreviousRequestId(eA) {
        let el = eA.conversationRequestId,
          ec = Array.isArray(eA.history) ? eA.history.slice(-20).reverse() : [],
          eu = [],
          ed = new Set();
        for (let eA of ec) {
          let ec = this.findRequestId(eA, el);
          ec && !ed.has(ec) && (ed.add(ec), eu.push(ec));
        }
        return eu.length ? eu.join(",") : void 0;
      }
      findRequestId(eA, el, ec = 0) {
        if (ec > 4 || !eA || "object" != typeof eA) return;
        let eu = eA;
        for (let eA of [
          "requestId",
          "conversationRequestId",
          "modelRequestId",
        ]) {
          let ec = eu[eA];
          if ("string" == typeof ec && ec && ec !== el) return ec;
        }
        for (let eA of Object.values(eu))
          if (Array.isArray(eA))
            for (let eu of eA.slice(-5)) {
              let eA = this.findRequestId(eu, el, ec + 1);
              if (eA) return eA;
            }
          else if (eA && "object" == typeof eA) {
            let eu = this.findRequestId(eA, el, ec + 1);
            if (eu) return eu;
          }
      }
      extractLinkedExecutionSignal(eA) {
        for (let el of Array.isArray(eA.history)
          ? eA.history.slice(-10).reverse()
          : []) {
          if (!el || "object" != typeof el) continue;
          let eA = el;
          if ("function_call_result" !== eA.type) continue;
          let ec = "string" == typeof eA.output ? eA.output : void 0;
          if (ec?.trim()) return ec.slice(0, 300);
          let eu = "string" == typeof eA.error ? eA.error : void 0;
          if (eu?.trim()) return eu.slice(0, 300);
        }
      }
    };
    const originalModule = {};
    Object.defineProperty(originalModule, "__esModule", { value: true });
    Object.defineProperty(
      originalModule,
      "CHAT_PROMPT_FRICTION_ANALYSIS_EVENT",
      { enumerable: true, get: () => eB },
    );
    Object.defineProperty(originalModule, "FrictionAnalysisService", {
      enumerable: true,
      get: () => ew,
    });
    Object.defineProperty(originalModule, "FrictionAnalysisServiceImpl", {
      enumerable: true,
      get: () => e_,
    });
    Object.defineProperty(originalModule, "buildFrictionTelemetryPayload", {
      enumerable: true,
      get: () => buildFrictionTelemetryPayload,
    });
    Object.defineProperty(
      originalModule,
      "extractVisibleUserPromptFromAcpPrompt",
      { enumerable: true, get: () => extractVisibleUserPromptFromAcpPrompt },
    );
    Object.defineProperty(
      originalModule,
      "extractVisibleUserPromptFromAgentInput",
      { enumerable: true, get: () => extractVisibleUserPromptFromAgentInput },
    );
    const result = {
      ...originalModule,
      FrictionAnalysisServiceImpl: e_,
      normalizePromptText,
      readTextValue,
      extractVisibleUserPromptFromAcpPrompt,
      extractTextFromInputContent,
      extractVisibleUserPromptFromAgentInput,
      buildFrictionTelemetryPayload,
    };
    Object.defineProperty(result, "originalModule", { value: originalModule });
    return result;
  })();
  const recall = (() => {
    const eE = load(82485);
    let eC = Symbol("FrictionRecallClient"),
      ey = "/agenttool/v1/intent/recall",
      ew = 3e3,
      eB = {
        "error / tool failure": "error_tool_failure",
        "performance friction": "performance_friction",
        "repeated rephrasing": "repeated_rephrasing",
        "escalation tone": "escalation_tone",
        "platform confusion": "platform_confusion",
        "abandoned tool flow": "abandoned_tool_flow",
        "backtracking / revert": "backtracking_revert",
        "context churn": "context_churn",
        "quality disappointment": "quality_disappointment",
        "trust degradation": "trust_degradation",
        "communication mismatch": "communication_mismatch",
        "specification drift": "specification_drift",
        "unexpected side effect": "unexpected_side_effect",
        "data loss risk": "data_loss_risk",
        "no progress / looping": "no_progress_looping",
        "unclear status": "unclear_status",
        "safety / privacy concern": "safety_privacy_concern",
        "approval fatigue": "approval_fatigue",
        "insufficient evidence": "insufficient_evidence",
      },
      e_ = new Set(Object.values(eB)),
      eI = new Set([
        "tool_reliability",
        "model_runtime",
        "product_ux",
        "latency",
        "model_understanding",
        "context_retrieval",
        "output_quality",
        "permission_or_policy",
        "workflow_orchestration",
        "specification_drift",
        "user_requirement_ambiguity",
        "communication_mismatch",
      ]);
    function normalizeLabel(eA) {
      return eA.replace(/\s+/g, " ").trim().toLowerCase();
    }
    function parseFrictionType(eA) {
      let el = normalizeLabel(eA);
      return e_.has(el) ? el : eB[el];
    }
    function parseSeverity(eA) {
      let el = normalizeLabel(eA);
      return "high" === el || "medium" === el || "low" === el ? el : void 0;
    }
    function parseRootCauseCandidate(eA) {
      return eA
        .split("/")
        .map((eA) => normalizeLabel(eA).replace(/\s+/g, "_"))
        .find((eA) => eI.has(eA));
    }
    function isRecallResult(eA) {
      if (!eA || "object" != typeof eA) return !1;
      let el = eA;
      return (
        "string" == typeof el.user_prompt &&
        "string" == typeof el.friction_type &&
        "string" == typeof el.severity &&
        "string" == typeof el.attribution &&
        "number" == typeof el.score &&
        Number.isFinite(el.score)
      );
    }
    function parseFrictionRecallResponse(eA) {
      if (!eA || "object" != typeof eA) return;
      let el = eA,
        ec = el.data?.results ?? el.results;
      if (!Array.isArray(ec) || !ec.length) return;
      let eu = ec
        .filter(isRecallResult)
        .sort((eA, el) => el.score - eA.score)[0];
      if (!eu) return;
      let ed = parseFrictionType(eu.friction_type),
        ep = parseSeverity(eu.severity),
        eg = parseRootCauseCandidate(eu.attribution);
      if (ed && ep && eg && eu.user_prompt.trim())
        return {
          frictionType: ed,
          severity: ep,
          evidenceText: eu.user_prompt.trim(),
          rootCauseCandidate: eg,
        };
    }
    let ev = class {
      async recall(eA) {
        try {
          let el = await this.productManager.waitConfiguration(),
            ec = (0, eE.isChatPromptFrictionAnalysisEnabled)(
              el.productFeatures,
            );
          if (
            (this.logger.info(`[FrictionAnalysis] Recall gate enabled=${ec}`),
            !ec)
          )
            return;
          let eu = await this.restOperations.request({
            url: ey,
            method: "POST",
            baseURL: el.endpoint,
            timeout: ew,
            data: { query: eA },
          });
          return parseFrictionRecallResponse(eu.data);
        } catch (el) {
          let eA = el instanceof Error ? el.message : String(el);
          this.logger.warn(`Failed to recall prompt friction intent: ${eA}`);
          return;
        }
      }
    };
    const originalModule = {};
    Object.defineProperty(originalModule, "__esModule", { value: true });
    Object.defineProperty(originalModule, "FrictionRecallClient", {
      enumerable: true,
      get: () => eC,
    });
    Object.defineProperty(originalModule, "FrictionRecallClientImpl", {
      enumerable: true,
      get: () => ev,
    });
    Object.defineProperty(originalModule, "parseFrictionRecallResponse", {
      enumerable: true,
      get: () => parseFrictionRecallResponse,
    });
    const result = {
      ...originalModule,
      FrictionRecallClientImpl: ev,
      normalizeLabel,
      parseFrictionType,
      parseSeverity,
      parseRootCauseCandidate,
      isRecallResult,
      parseFrictionRecallResponse,
    };
    Object.defineProperty(result, "originalModule", { value: originalModule });
    return result;
  })();
  const usageUtils = (() => {
    const Ac = load(69466);
    const Ag = load(18553);
    const tc = load(21580);
    let UsageUtils = class UsageUtils {
      static getLatestUsage(eA) {
        let el = tc.HistoryUtils.getActiveAgentOnlyHistory(eA.history),
          ec = el.length > 0 ? el : eA.history;
        for (let eA = ec.length - 1; eA >= 0; eA--) {
          let el = ec[eA];
          if (el.providerData?.usage) {
            if (el.providerData?.agent === Ac.AgentNames.COMPACT) continue;
            return normalizeUsage(el.providerData.usage);
          }
        }
      }
      static getTotalUsage(eA) {
        let el = new Ag.Usage();
        for (let ec of eA) {
          let eA = ec.providerData?.usage;
          eA && el.add(normalizeUsage(eA));
        }
        return el;
      }
      static getCacheReadTokens(eA) {
        if (!eA) return 0;
        let el = Array.isArray(eA.inputTokensDetails)
          ? eA.inputTokensDetails.reduce(
              (eA, el) => eA + (el?.cached_tokens ?? 0),
              0,
            )
          : eA.inputTokensDetails?.cached_tokens;
        return firstPositiveTokenCount(
          eA.cache_read_input_tokens,
          eA.cacheReadInputTokens,
          el,
          eA.prompt_tokens_details?.cached_tokens,
          eA.prompt_cache_hit_tokens,
        );
      }
      static getCacheCreationTokens(eA) {
        return eA
          ? firstPositiveTokenCount(
              eA.cache_creation_input_tokens,
              eA.cacheCreationInputTokens,
              eA.prompt_cache_write_tokens,
              eA.prompt_cache_miss_tokens,
            )
          : 0;
      }
      static getAggregatedCacheUsage(eA) {
        let el = 0,
          ec = 0;
        for (let eu of eA) {
          let eA = eu.providerData?.rawUsage || eu.providerData?.usage;
          eA &&
            ((el += UsageUtils.getCacheReadTokens(eA)),
            (ec += UsageUtils.getCacheCreationTokens(eA)));
        }
        return { cacheRead: el, cacheCreation: ec };
      }
    };
    function firstPositiveTokenCount(...eA) {
      for (let el of eA) if ("number" == typeof el && el > 0) return el;
      return 0;
    }
    function normalizeUsage(eA) {
      return eA instanceof Ag.Usage ? eA : new Ag.Usage(eA);
    }
    const originalModule = {};
    const result = {
      ...originalModule,
      UsageUtils: UsageUtils,
      firstPositiveTokenCount,
      normalizeUsage,
    };
    Object.defineProperty(result, "originalModule", { value: originalModule });
    return result;
  })();
  return {
    ...broadcast,
    ...usage,
    ...title,
    ...friction,
    ...recall,
    ...usageUtils,
    titleHelpers: load(20881),
    SessionTitleService: load(76586).SessionTitleService,
    getModule: load,
  };
}

// Complete fixed Desktop user-prompt declarations; app DI and external Docs engine are explicit seams.
import * as node_path from "node:path";
import * as node_url from "node:url";
import * as realCrypto from "node:crypto";
export const USER_PROMPT_SHA256 =
  "8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78";
export const USER_PROMPT_CLASSES = [
  ["TencentDocsAdditionalSection", 1843709, 1849441],
  ["AdditionalDataSection", 1869827, 1872125],
  ["ArdotDesignStyleSection", 1873305, 1874168],
  ["ArdotFileDirectiveSection", 1876196, 1876640],
  ["ArdotImageGenSection", 1879219, 1879475],
  ["AttachedSkillsSection", 1879686, 1880251],
  ["AutomationSystemReminderSection", 1880410, 1880620],
  ["CurrentExpertReminderSection", 1881614, 1882431],
  ["IdentityContextSection", 1882571, 1883045],
  ["ModeTransitionReminderSection", 1884442, 1885059],
  ["ProjectContextSection", 1885395, 1885952],
  ["RulesSection", 1888507, 1889374],
  ["SpecialInstructionsSection", 1889522, 1890238],
  ["SystemReminderSection", 1890376, 1890639],
  ["UserCommandSection", 1899358, 1900187],
  ["UserInfoSection", 1900313, 1900984],
  ["WorkingMemoryReminderSection", 1901633, 1903643],
  ["WorkbuddyUserPromptService", 1909364, 1926791],
] as const;
export const USER_PROMPT_FUNCTIONS = [
  ["wrapTeamProjectContext", 346362, 346648],
  ["formatProjectFileRulesXml", 349224, 349550],
  ["escapeXmlAttribute$1", 349551, 349697],
  ["wrapXmlTextCdata", 349698, 349799],
  ["wrapXmlTextElement", 349800, 350170],
  ["wrapHiddenContextXml", 350171, 350393],
  ["stripSystemReminderXml", 350394, 350487],
  ["wrapUserQueryXml", 350488, 350567],
  ["addUniquePath", 141644, 141772],
  ["isWindowsAbsoluteLocalPath", 141826, 141911],
  ["normalizeMentionedLocalPath", 142060, 142392],
  ["collectPromptStringCandidates", 142617, 143262],
  ["getTextMentionedLocalOfficeFilePaths", 143501, 144222],
  ["getTextMentionedLocalOfficeFileNames", 144552, 145014],
  ["mergeUniquePaths", 145112, 145319],
  ["readString$4", 246089, 246207],
  ["readPromptSelectionPayload", 246492, 246744],
  ["parseTencentDocsSelectionBlock", 247334, 248391],
  ["getAllTencentDocsSelectionsFromPrompt", 248764, 248995],
  ["isTencentOnlineFilePath", 5072, 5190],
  ["extractTencentOnlineFileId", 5259, 5437],
  ["computeLocalPreviewGlobalPadId", 5993, 6186],
  ["isLocalPreviewGlobalPadId", 6187, 6457],
  ["hasTencentDocsAiServiceExtension", 30851, 31174],
  ["isTencentDocsAiServiceFilePath", 31245, 31414],
  ["resolveToolUsableLocalFileId", 145548, 145821],
  ["deriveAccountContext", 342891, 343595],
  ["resolveTencentDocsAiEditConfigEnabled", 343978, 344420],
  ["parseMarkdownFrontmatter", 892131, 892505],
  ["extractFrontmatterField", 892589, 893225],
  ["stripYamlQuotes", 893226, 893447],
  ["readBlockScalar", 893638, 894733],
  ["normalizeExtension", 1818385, 1818637],
  ["isImageExtension", 1818638, 1818712],
  ["isTextDocumentExtension", 1818713, 1818802],
  ["isCodeExtension", 1818803, 1818875],
  ["isOfficeDocumentExtension", 1818876, 1818969],
  ["sizeExceeded", 1818970, 1819087],
  ["formatMb", 1819088, 1819164],
  ["classifyNetDriveItem", 1819165, 1821126],
  ["getCodebuddyMeta", 1821233, 1821356],
  ["getResourceLinks", 1821357, 1821563],
  ["getFileResourceLinks", 1821564, 1821688],
  ["getCommandResourceLinks", 1821689, 1821819],
  ["getImaResourceLinks", 1821820, 1821942],
  ["getLexiangResourceLinks", 1821943, 1822073],
  ["getAgentMailResourceLinks", 1822074, 1822208],
  ["getNetDriveResourceLinks", 1822209, 1822341],
  ["getWechatChatHistoryResourceLinks", 1822342, 1822494],
  ["getAttachedNetDriveItems", 1822495, 1824154],
  ["parseNetDriveUri", 1824155, 1824780],
  ["getAttachedImaFiles", 1824781, 1825930],
  ["getAttachedLexiangFiles", 1825931, 1826859],
  ["getAttachedAgentMails", 1826860, 1827555],
  ["parseLexiangUri", 1827556, 1828516],
  ["getAttachedTodoReferences", 1829063, 1830265],
  ["parseTodoIdFromUri", 1830266, 1830411],
  ["getAttachedMessageReferences", 1830860, 1831407],
  ["getAttachedSkills", 1831408, 1832269],
  ["getFileAndFolderPaths", 1832270, 1832699],
  ["resolveFileReferencePaths", 1832941, 1833335],
  ["resolveResourceLinkLocalPath", 1833336, 1834079],
  ["hasUriScheme", 1834080, 1834160],
  ["resolveLocalPath", 1834161, 1834795],
  ["getCommandPrompt", 1834796, 1835002],
  ["getIntegrationPrompt", 1835003, 1835233],
  ["getAutomationSystemReminder", 1835234, 1835506],
  ["getArdotFileAction", 1835950, 1836137],
  ["getDesignStyleType", 1836325, 1836491],
  ["getDesignStyleUrl", 1836619, 1836716],
  ["getDesignStyleId", 1836756, 1836851],
  ["getImageMode", 1837019, 1837163],
  ["isPlanMode", 1837164, 1837367],
  ["toLocalPath", 1837368, 1837609],
  ["decodeURIComponentSafe", 1837610, 1837725],
  ["readString$2", 1837726, 1837926],
  ["readNumber", 1837927, 1838166],
  ["readBoolean", 1838167, 1838417],
  ["getExtension", 1838418, 1838547],
  ["getAttachedWechatChatHistoryItems", 1838764, 1840382],
  ["readString$1", 1840526, 1840726],
  ["getTencentDocResourceLinks", 1840764, 1840894],
  ["getAttachedTencentDocs", 1840986, 1841688],
  ["appendFileIdToUrl", 1841839, 1842118],
  ["readString", 1842165, 1842281],
  ["readRawSelectionString", 1842315, 1842436],
  ["buildRemoteDocFromSelection", 1842754, 1843090],
  ["appendUniqueTencentDoc", 1843127, 1843324],
  ["getPromptBlockTypes", 1843371, 1843533],
  ["normalizeFileId", 1849596, 1849669],
  ["rememberNetDriveAttachments", 1849670, 1850033],
  ["clearNetDriveAttachments", 1850034, 1850186],
  ["readNonEmptyString$1", 1850393, 1850515],
  ["readExpertSelectionIdentity", 1850516, 1850775],
  ["isSameExpertSelection", 1850776, 1850914],
  ["escapeXmlText$2", 1850915, 1851080],
  ["readExpertDisplayName", 1851081, 1851528],
  ["renderCancelledSelection", 1851529, 1851937],
  ["renderExpertSelectionReminder", 1851938, 1853425],
  ["escapeXmlAttribute", 1853505, 1853599],
  ["escapeXmlText$1", 1853600, 1853717],
  ["renderImaUsage", 1855098, 1856003],
  ["renderWorkBuddyFileHandling", 1858389, 1858482],
  ["renderLexiangUsage", 1858483, 1859175],
  ["renderAgentMailUsage", 1859674, 1860321],
  ["renderNetdriveRoot", 1861070, 1861363],
  ["renderConnectorStatusBlock", 1861604, 1861996],
  ["renderWechatChatHistory", 1863924, 1865363],
  ["renderTodoReferenceXml", 1866152, 1866816],
  ["renderMessageReferenceXml", 1867790, 1868765],
  ["renderNetDriveAttachments", 1869388, 1869798],
  ["extractFilename", 1874386, 1874523],
  ["escapeAttr", 1874658, 1874818],
  ["isCraftMode", 1876843, 1876961],
  ["renderInstruction", 1877045, 1878359],
  ["readNonEmptyString", 1880738, 1880843],
  ["escapeXmlText", 1880844, 1880959],
  ["readExpertTypeLabel", 1880960, 1881087],
  ["loadSystemReminderTemplate", 1883361, 1883510],
  ["loadModeTransitionReminderTemplate", 1883511, 1883725],
  ["requirePromptTemplate", 1883726, 1883816],
  ["readTransitionMode", 1883934, 1884027],
  ["readProjectGuidance", 1885954, 1886465],
  ["readProjectLayout", 1886466, 1887424],
  ["summarizeSubtree", 1887425, 1888389],
  ["getConfigDir", 1891901, 1892207],
  ["parseCommandUri", 1892508, 1893262],
  ["resolveMarketplaceRoot", 1893369, 1893814],
  ["resolvePluginSourceFromManifest", 1894000, 1894557],
  ["collectPluginBaseDirs", 1895115, 1896136],
  ["findCommandFile", 1896383, 1897339],
  ["readCommandFile", 1897389, 1897966],
  ["resolveCommandContents", 1898171, 1899227],
  ["resolveProjectMemoryFolderName", 1901102, 1901219],
  ["isLocalSkillsMemoryDisabled", 1901474, 1901597],
  ["renderProjectInstructionsXml", 1904840, 1905086],
  ["renderWorkSummaryXml", 1905087, 1905204],
  ["isProjectAccessError", 1905575, 1905845],
  ["encodeMsgSnippetForOccupier", 1906179, 1906290],
  ["replaceTeamsChipsWithOccupier", 1907729, 1909330],
  ["isAbsoluteLocalPath", 30691, 30803],
] as const;
export const USER_PROMPT_CONSTANTS = [
  ["SYSTEM_REMINDER_BLOCK_RE", 345601, 345690],
  ["USER_CONTEXT_ROLE", 345691, 345730],
  ["ADDITIONAL_DATA_ROLE", 345933, 345978],
  ["TEAM_PROJECT_CONTEXT_TAG", 346208, 346262],
  ["TEAM_PROJECT_CONTEXT_IDENTITY", 346747, 346897],
  ["PROJECT_TOOL_ROUTING_XML", 347070, 347715],
  ["PROJECT_FILE_RULES_HEADER", 347759, 348003],
  ["PROJECT_FILE_RULES_MANDATORY_WORKFLOW", 348069, 348901],
  ["FILE_URI_PATTERN", 140095, 140141],
  ["LOCAL_PATH_DRIVE_OR_POSIX_PREFIX", 140197, 140269],
  ["DOUBLE_QUOTED_LOCAL_PATH_PATTERN", 140331, 140450],
  ["SINGLE_QUOTED_LOCAL_PATH_PATTERN", 140484, 140603],
  ["UNQUOTED_LOCAL_PATH_PATTERN", 140705, 140909],
  ["PLAIN_LOCAL_OFFICE_FILENAME_PATTERN", 141030, 141229],
  ["MAX_PROMPT_SCAN_DEPTH", 141277, 141307],
  ["MAX_PROMPT_STRING_LENGTH", 141360, 141397],
  ["SKIPPED_PROMPT_STRING_KEYS", 141484, 141586],
  ["TENCENT_ONLINE_FILE_PATH_PREFIX", 5023, 5071],
  ["DEFAULT_ENTERPRISE_VARIANT_KEY", 342289, 342339],
  ["VPC_ENTERPRISE_VARIANT_KEY", 342340, 342390],
  ["IMAGE_EXTENSIONS", 1816592, 1816668],
  ["TEXT_DOCUMENT_EXTENSIONS", 1816669, 1816786],
  ["CODE_EXTENSIONS", 1816787, 1816911],
  ["OFFICE_DOCUMENT_EXTENSIONS", 1816996, 1817091],
  ["IMAGE_MIME_TYPES", 1817092, 1817237],
  ["TEXT_MIME_TYPES", 1817238, 1817797],
  ["OFFICE_MIME_TYPES", 1817798, 1818193],
  ["NETDRIVE_FILE_SIZE_LIMITS", 1818194, 1818384],
  ["TODO_TAG_KEY_WHITELIST", 1828598, 1828715],
  ["LOCAL_FILE_MENTION_TYPES", 1832700, 1832779],
  ["attachmentsBySession", 1849542, 1849595],
  ["MAX_EXPERT_PROMPT_CHARS", 1850288, 1850322],
  ["EXPERT_SELECTION_BLOCK_META_KEY", 1850323, 1850392],
  ["BUILTIN_DEFAULT_CONNECTOR", 1854000, 1854051],
  ["IMA_USAGE_INSTRUCTIONS", 1854052, 1855097],
  ["LEXIANG_USAGE_INSTRUCTIONS", 1856448, 1857442],
  ["WORKBUDDY_FILE_HANDLING_INSTRUCTIONS", 1858053, 1858388],
  ["AGENT_MAIL_USAGE_INSTRUCTIONS", 1859176, 1859673],
  ["NETDRIVE_USAGE_HEADER", 1862331, 1862577],
  ["WECHAT_CHAT_HISTORY_INSTRUCTIONS", 1863167, 1863923],
  ["TODO_REFERENCE_HEADER", 1865528, 1865777],
  ["MESSAGE_REFERENCE_HEADER", 1866992, 1867209],
  ["INSTRUCTION", 1879585, 1879657],
  ["TEMPLATE_NAMES", 1883133, 1883360],
  ["GUIDANCE_FILES", 1885169, 1885252],
  ["MAX_GUIDANCE_CHARS", 1885253, 1885282],
  ["MAX_LAYOUT_ENTRIES", 1885283, 1885311],
  ["MAX_SUBTREE_DEPTH", 1885312, 1885338],
  ["MAX_TOP_EXTENSIONS", 1885339, 1885366],
  ["KNOWN_MARKETPLACES_FILE", 1891569, 1891625],
  ["MARKETPLACE_MANIFEST_FILE", 1891626, 1891677],
  ["PLUGIN_METADATA_DIRS", 1891678, 1891745],
  ["PROJECT_INSTRUCTIONS_HEADER", 1904032, 1904313],
  ["PROJECT_INSTRUCTIONS_REVOKE_NOTICE", 1904358, 1904523],
  ["WORK_SUMMARY_HEADER", 1904605, 1904839],
  ["TENCENT_DOCS_AI_FILE_SUPPORT_WHITELIST", 29824, 30405],
  ["TENCENT_DOCS_AI_FILE_EXTENSION_WHITELIST", 30406, 30547],
  ["TENCENT_DOCS_AI_SERVICE_EXTENSIONS", 30548, 30690],
] as const;
export function createNativeUserPrompt(runtime: any) {
  const Object: any = globalThis.Object,
    Map: any = globalThis.Map,
    Set: any = globalThis.Set;
  const Date: any = runtime.Date ?? globalThis.Date,
    Intl: any = runtime.Intl ?? globalThis.Intl;
  const process: any = {
    env: runtime.env ?? {},
    cwd: runtime.getWorkDir,
    platform: runtime.platform ?? globalThis.process.platform,
  };
  const node_fs: any = runtime.fs,
    node_fs_promises: any = runtime.fs.promises,
    node_os: any = runtime.os;
  const node_crypto: any = runtime.crypto ?? realCrypto,
    console: any = runtime.console ?? globalThis.console;
  const windowLog: any = runtime.logger;
  const require_common$2: any = runtime.common;
  const _tencent_tencent_docs_ai_engine: any = runtime.tencentDocsEngine;
  const getTencentDocsDocumentService = () => {
    if (!runtime.tencentDocsDocumentService)
      throw Error("Tencent Docs document service adapter is required");
    return runtime.tencentDocsDocumentService;
  };
  const requireWorkbuddyPromptTemplatePath =
    runtime.resourcePromptNative.requireWorkbuddyPromptTemplatePath;
  const readAppConfigValue = runtime.resourcePromptNative.readAppConfigValue;
  const APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY =
    runtime.resourcePromptNative.APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY;
  var TENCENT_DOCS_AI_FILE_SUPPORT_WHITELIST: any = Object.freeze(
    [
      {
        "kind": "doc",
        "extensions": [
          ".doc",
          ".docx",
          ".dot",
          ".dotx",
          ".wps",
          ".wpt",
          ".docm",
          ".dotm",
        ],
      },
      {
        "kind": "sheet",
        "extensions": [
          ".csv",
          ".xls",
          ".xlsx",
          ".xlt",
          ".xltx",
          ".xlsm",
          ".xltm",
        ],
      },
      {
        "kind": "slide",
        "extensions": [
          ".pptx",
          ".ppt",
          ".pps",
          ".pot",
          ".pptm",
          ".ppsx",
          ".ppsm",
          ".potx",
          ".potm",
        ],
      },
    ].map(({ kind, extensions }: any) =>
      Object.freeze({
        kind,
        extensions: Object.freeze([...extensions]),
      }),
    ),
  );
  var TENCENT_DOCS_AI_FILE_EXTENSION_WHITELIST: any = Object.freeze(
    TENCENT_DOCS_AI_FILE_SUPPORT_WHITELIST.flatMap(
      ({ extensions }: any) => extensions,
    ),
  );
  var TENCENT_DOCS_AI_SERVICE_EXTENSIONS: any = new Set(
    TENCENT_DOCS_AI_FILE_EXTENSION_WHITELIST.map((ext: any) =>
      ext.replace(/^\./, "").toLowerCase(),
    ),
  );
  function isAbsoluteLocalPath(filePath: any): any {
    return filePath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(filePath);
  }
  // UTF-16 345601..345690
  var SYSTEM_REMINDER_BLOCK_RE: any =
    /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g;
  // UTF-16 345691..345730
  var USER_CONTEXT_ROLE: any = "user-context";
  // UTF-16 345933..345978
  var ADDITIONAL_DATA_ROLE: any = "additional-data";
  // UTF-16 346208..346262
  var TEAM_PROJECT_CONTEXT_TAG: any = "team-project-context";
  // UTF-16 346362..346648
  function wrapTeamProjectContext(inner: any): any {
    const parts: any = (Array.isArray(inner) ? inner : [inner])
      .map((p: any) => (p ?? "").trim())
      .filter((p: any) => p.length > 0);
    if (parts.length === 0) return "";
    return `<${TEAM_PROJECT_CONTEXT_TAG}>\n${parts.join("\n")}\n</${TEAM_PROJECT_CONTEXT_TAG}>`;
  }
  // UTF-16 346747..346897
  var TEAM_PROJECT_CONTEXT_IDENTITY: any =
    "You are working within a project. The project may have shared files/assets, members, todos/tasks, and messages.";
  // UTF-16 347070..347715
  var PROJECT_TOOL_ROUTING_XML: any = [
    "<project-tool-routing>",
    "Select tools by the user's actual intent:",
    "- Project shared files: use `tdrive.*` and search project files only when the user asks to access/list/search/read/write project assets, project drive, or shared project files. Do not search project files just to gather background for a report, plan, or task.",
    "- Project members: use `project_members` to resolve members.",
    "- Todos/tasks: use `todo_create` / `todo_list` / `todo_update` as needed.",
    "- Project messages: use `project_message_*` to list, view, add, reply, edit, or delete.",
    "</project-tool-routing>",
  ].join("\n");
  // UTF-16 347759..348003
  var PROJECT_FILE_RULES_HEADER: any = [
    "There are two file systems (sandbox is the default):",
    "- Sandbox filesystem: for local/uploads/artifacts files.",
    "- Project Drive/assets (tdrive): a shared project file system (root below).",
  ].join("\n");
  // UTF-16 348069..348901
  var PROJECT_FILE_RULES_MANDATORY_WORKFLOW: any = [
    "PROJECT DRIVE / ASSETS (tdrive) — MANDATORY WORKFLOW:",
    "- Any mutating operation on Project Drive (create, upload, modify, move, rename, delete, overwrite) MUST be confirmed with the user before execution.",
    "- For Drive file edits, follow this mandatory review-before-upload workflow:",
    "  1. Download the latest Drive file immediately before editing to avoid overwriting others' changes, then make changes locally.",
    "  2. Show the user what changed, ask for explicit confirmation, then STOP.",
    "  3. Resume the Project Drive mutation only after the user clearly approves the reviewed local version.",
    "- Never upload the locally modified file back to Project Drive directly after editing. MUST show the changes to the user and get explicit confirmation first.",
  ].join("\n");
  // UTF-16 349224..349550
  function formatProjectFileRulesXml(tdriveRootXml: any): any {
    const root: any = (tdriveRootXml ?? "").trim();
    return `<project-file-rules>\n${root ? `${PROJECT_FILE_RULES_HEADER}\n\n${root}\n\n${PROJECT_FILE_RULES_MANDATORY_WORKFLOW}` : `${PROJECT_FILE_RULES_HEADER}\n\n${PROJECT_FILE_RULES_MANDATORY_WORKFLOW}`}\n</project-file-rules>`;
  }
  // UTF-16 349551..349697
  function escapeXmlAttribute$1(value: any): any {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  // UTF-16 349698..349799
  function wrapXmlTextCdata(text: any): any {
    return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
  }
  // UTF-16 349800..350170
  function wrapXmlTextElement(tag: any, text: any, attrs?: any): any {
    const attributeText: any = Object.entries(attrs ?? {})
      .filter(([, value]: any) => typeof value === "string" && value.length > 0)
      .map(([key, value]: any) => `${key}="${escapeXmlAttribute$1(value)}"`)
      .join(" ");
    return [
      attributeText ? `<${tag} ${attributeText}>` : `<${tag}>`,
      wrapXmlTextCdata(text),
      `</${tag}>`,
    ].join("\n");
  }
  // UTF-16 350171..350393
  function wrapHiddenContextXml(xml: any, role: any = USER_CONTEXT_ROLE): any {
    const content: any = xml.trim();
    if (!content) return "";
    return `<system-reminder data-role="${escapeXmlAttribute$1(role)}">\n${content}\n</system-reminder>`;
  }
  // UTF-16 350394..350487
  function stripSystemReminderXml(text: any): any {
    return text.replace(SYSTEM_REMINDER_BLOCK_RE, "");
  }
  // UTF-16 350488..350567
  function wrapUserQueryXml(text: any): any {
    return `<user_query>${text}</user_query>`;
  }
  // UTF-16 140095..140141
  var FILE_URI_PATTERN: any = /file:\/\/[^\s"'<>]+/g;
  // UTF-16 140197..140269
  var LOCAL_PATH_DRIVE_OR_POSIX_PREFIX: any = String.raw`(?:[A-Za-z]:[\\/]|/)`;
  // UTF-16 140331..140450
  var DOUBLE_QUOTED_LOCAL_PATH_PATTERN: any = new RegExp(
    String.raw`@?"(${LOCAL_PATH_DRIVE_OR_POSIX_PREFIX}[^"\r\n]+)"`,
    "g",
  );
  // UTF-16 140484..140603
  var SINGLE_QUOTED_LOCAL_PATH_PATTERN: any = new RegExp(
    String.raw`@?'(${LOCAL_PATH_DRIVE_OR_POSIX_PREFIX}[^'\r\n]+)'`,
    "g",
  );
  // UTF-16 140705..140909
  var UNQUOTED_LOCAL_PATH_PATTERN: any = new RegExp(
    String.raw`(?:^|[\s([{（【])@?` +
      String.raw`(${LOCAL_PATH_DRIVE_OR_POSIX_PREFIX}[^\s"'<>]+?\.[A-Za-z0-9]{1,12})` +
      String.raw`(?=$|[\s)\]}）】，。；;：:!?！？])`,
    "g",
  );
  // UTF-16 141030..141229
  var PLAIN_LOCAL_OFFICE_FILENAME_PATTERN: any = new RegExp(
    String.raw`(?:^|[\s"'([{（【])` +
      String.raw`([^\/\\\s"'<>)}\]）】，。；;：:!?！？]+?\.[A-Za-z0-9]{1,12})` +
      String.raw`(?=$|[\s"'）)\]}】，。；;：:!?！？])`,
    "g",
  );
  // UTF-16 141277..141307
  var MAX_PROMPT_SCAN_DEPTH: any = 5;
  // UTF-16 141360..141397
  var MAX_PROMPT_STRING_LENGTH: any = 16384;
  // UTF-16 141484..141586
  var SKIPPED_PROMPT_STRING_KEYS: any = new Set([
    "data",
    "base64",
    "image",
    "mimeType",
    "thumbnail",
  ]);
  // UTF-16 141644..141772
  function addUniquePath(target: any, seen: any, filePath: any): any {
    if (seen.has(filePath)) return;
    seen.add(filePath);
    target.push(filePath);
  }
  // UTF-16 141826..141911
  function isWindowsAbsoluteLocalPath(value: any): any {
    return /^[A-Za-z]:[\\/]/.test(value);
  }
  // UTF-16 142060..142392
  function normalizeMentionedLocalPath(value: any): any {
    const trimmed: any = value.trim().replace(/[，。；;：:,.!?！？]+$/u, "");
    if (!trimmed) return;
    if (trimmed.startsWith("file://"))
      try {
        return (0, node_url.fileURLToPath)(trimmed);
      } catch {
        return;
      }
    if (trimmed.startsWith("/") || isWindowsAbsoluteLocalPath(trimmed))
      return trimmed;
  }
  // UTF-16 142617..143262
  function collectPromptStringCandidates(value: any, depth: any = 0): any {
    if (depth > MAX_PROMPT_SCAN_DEPTH || value === null || value === void 0)
      return [];
    if (typeof value === "string")
      return value.length > MAX_PROMPT_STRING_LENGTH
        ? [value.slice(0, MAX_PROMPT_STRING_LENGTH)]
        : [value];
    if (Array.isArray(value))
      return value.flatMap((item: any) =>
        collectPromptStringCandidates(item, depth + 1),
      );
    if (typeof value !== "object") return [];
    const strings: any = [];
    for (const [key, child] of Object.entries(value)) {
      if (SKIPPED_PROMPT_STRING_KEYS.has(key)) continue;
      strings.push(...collectPromptStringCandidates(child, depth + 1));
    }
    return strings;
  }
  // UTF-16 143501..144222
  function getTextMentionedLocalOfficeFilePaths(prompt: any): any {
    const result: any = [];
    const seen: any = /* @__PURE__ */ new Set();
    const tryAdd: any = (raw: any) => {
      const filePath: any = normalizeMentionedLocalPath(raw);
      if (!isTencentDocsAiServiceFilePath(filePath ?? "")) return;
      addUniquePath(result, seen, filePath);
    };
    for (const text of collectPromptStringCandidates(prompt)) {
      for (const match of text.matchAll(FILE_URI_PATTERN)) tryAdd(match[0]);
      for (const match of text.matchAll(DOUBLE_QUOTED_LOCAL_PATH_PATTERN))
        tryAdd(match[1]);
      for (const match of text.matchAll(SINGLE_QUOTED_LOCAL_PATH_PATTERN))
        tryAdd(match[1]);
      for (const match of text.matchAll(UNQUOTED_LOCAL_PATH_PATTERN))
        tryAdd(match[1]);
    }
    return result;
  }
  // UTF-16 144552..145014
  function getTextMentionedLocalOfficeFileNames(prompt: any): any {
    const result: any = [];
    const seen: any = /* @__PURE__ */ new Set();
    for (const text of collectPromptStringCandidates(prompt))
      for (const match of text.matchAll(PLAIN_LOCAL_OFFICE_FILENAME_PATTERN)) {
        const fileName: any = match[1]?.trim();
        if (!fileName || fileName.includes("/")) continue;
        if (!hasTencentDocsAiServiceExtension(fileName)) continue;
        addUniquePath(result, seen, fileName);
      }
    return result;
  }
  // UTF-16 145112..145319
  function mergeUniquePaths(first: any, second: any): any {
    const result: any = [];
    const seen: any = /* @__PURE__ */ new Set();
    for (const filePath of [...first, ...second])
      addUniquePath(result, seen, filePath);
    return result;
  }
  // UTF-16 246089..246207
  function readString$4(value: any): any {
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : void 0;
  }
  // UTF-16 246492..246744
  function readPromptSelectionPayload(value: any): any {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return value;
    const {
      aiPrompt: _aiPrompt,
      sourceApi: _sourceApi,
      text: _text,
      description: _description,
      ...rest
    } = value;
    return rest;
  }
  // UTF-16 247334..248391
  function parseTencentDocsSelectionBlock(block: any): any {
    if (block.type !== "resource_link") return;
    const meta: any = block._meta;
    if (meta?.mentionType !== "tencentDocsSelection") return;
    const documentResourceUri: any = readString$4(meta.documentResourceUri);
    const filePath: any = readString$4(meta.filePath) ?? documentResourceUri;
    const rangeId: any = readString$4(meta.rangeId);
    if (!filePath || !rangeId) return;
    const fileType: any = readString$4(meta.fileType) ?? "unknown";
    const rawFileId: any =
      readString$4(meta.fileId) ??
      (documentResourceUri
        ? extractTencentOnlineFileId(documentResourceUri)
        : void 0) ??
      extractTencentOnlineFileId(filePath);
    const fileId: any = extractTencentOnlineFileId(filePath)
      ? rawFileId
      : resolveToolUsableLocalFileId(filePath, rawFileId);
    const sourceApi: any =
      readString$4(meta.sourceApi) ?? "documentSelectionContextBlock";
    const raw: any = meta.selectionPayload
      ? readPromptSelectionPayload(meta.selectionPayload)
      : {
          rangeId,
          ...(fileId ? { fileId } : {}),
        };
    return {
      filePath,
      fileType,
      ...(fileId ? { fileId } : {}),
      sourceApi,
      raw,
    };
  }
  // UTF-16 248764..248995
  function getAllTencentDocsSelectionsFromPrompt(prompt: any): any {
    const results: any = [];
    for (const block of prompt) {
      const selection: any = parseTencentDocsSelectionBlock(block);
      if (selection) results.push(selection);
    }
    return results;
  }
  // UTF-16 5023..5071
  var TENCENT_ONLINE_FILE_PATH_PREFIX: any = "tdoc://";
  // UTF-16 5072..5190
  function isTencentOnlineFilePath(filePath: any): any {
    return typeof filePath === "string" && filePath.startsWith("tdoc://");
  }
  // UTF-16 5259..5437
  function extractTencentOnlineFileId(filePath: any): any {
    if (!isTencentOnlineFilePath(filePath)) return;
    const fileId: any = filePath.slice(7);
    return fileId.length > 0 ? fileId : void 0;
  }
  // UTF-16 5993..6186
  function computeLocalPreviewGlobalPadId(filePath: any): any {
    const normalized: any = filePath.trim();
    if (!normalized) return;
    return (0, node_crypto.createHash)("md5").update(normalized).digest("hex");
  }
  // UTF-16 6187..6457
  function isLocalPreviewGlobalPadId(filePath: any, candidateFileId: any): any {
    const normalizedId: any = candidateFileId.trim();
    if (!normalizedId) return false;
    const globalPadId: any = computeLocalPreviewGlobalPadId(filePath);
    return Boolean(globalPadId && globalPadId === normalizedId);
  }
  // UTF-16 30851..31174
  function hasTencentDocsAiServiceExtension(fileNameOrPath: any): any {
    const cleanPath: any = fileNameOrPath.split(/[?#]/, 1)[0] ?? fileNameOrPath;
    const dot: any = cleanPath.lastIndexOf(".");
    if (dot < 0 || dot === cleanPath.length - 1) return false;
    return TENCENT_DOCS_AI_SERVICE_EXTENSIONS.has(
      cleanPath.slice(dot + 1).toLowerCase(),
    );
  }
  // UTF-16 31245..31414
  function isTencentDocsAiServiceFilePath(filePath: any): any {
    if (!filePath || !isAbsoluteLocalPath(filePath)) return false;
    return hasTencentDocsAiServiceExtension(filePath);
  }
  // UTF-16 145548..145821
  function resolveToolUsableLocalFileId(
    filePath: any,
    ...candidates: any
  ): any {
    if (!filePath) return;
    for (const candidate of candidates) {
      const normalized: any = candidate?.trim();
      if (!normalized || isLocalPreviewGlobalPadId(filePath, normalized))
        continue;
      return normalized;
    }
  }
  // UTF-16 342289..342339
  var DEFAULT_ENTERPRISE_VARIANT_KEY: any = "enterprise";
  // UTF-16 342340..342390
  var VPC_ENTERPRISE_VARIANT_KEY: any = "enterprise:vpc";
  // UTF-16 342891..343595
  function deriveAccountContext(options: any): any {
    const userId: any = options.userId?.trim() || "default";
    const enterpriseId: any = options.enterpriseId?.trim() || "";
    const accountType: any =
      options.accountType?.trim() || (enterpriseId ? "ultimate" : "personal");
    const isVPCAccount: any = accountType === "exclusive";
    const isEnterpriseAccount: any =
      accountType === "ultimate" ||
      isVPCAccount ||
      (!options.accountType && !!enterpriseId);
    return {
      userId,
      enterpriseId,
      accountType,
      kind: isEnterpriseAccount ? "enterprise" : "personal",
      deploymentKind: isVPCAccount
        ? "vpc"
        : isEnterpriseAccount
          ? "enterprise"
          : "personal",
      variantKey: isVPCAccount
        ? VPC_ENTERPRISE_VARIANT_KEY
        : DEFAULT_ENTERPRISE_VARIANT_KEY,
    };
  }
  // UTF-16 343978..344420
  function resolveTencentDocsAiEditConfigEnabled(
    productFeatures: any,
    account: any,
  ): any {
    const ctx: any = deriveAccountContext({
      enterpriseId: account?.enterpriseId,
      accountType: account?.type ?? account?.accountType ?? "",
    });
    const key: any =
      ctx.kind === "enterprise" || ctx.deploymentKind === "vpc"
        ? require_common$2.ProductFeature.TencentDocsAiEditEnterprise
        : require_common$2.ProductFeature.TencentDocsAiEdit;
    return productFeatures?.[key] === true;
  }
  // UTF-16 892131..892505
  function parseMarkdownFrontmatter(absFile: any): any {
    try {
      const content: any = node_fs.readFileSync(absFile, "utf-8");
      const match: any = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
      const block: any = match ? match[1] : content;
      return {
        name: extractFrontmatterField(block, "name"),
        description: extractFrontmatterField(block, "description"),
      };
    } catch {
      return {};
    }
  }
  // UTF-16 892589..893225
  function extractFrontmatterField(block: any, key: any): any {
    const lines: any = block.split(/\r?\n/);
    const keyPattern: any = new RegExp(
      `^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*(.*)$`,
    );
    for (let i: any = 0; i < lines.length; i++) {
      const line: any = lines[i];
      if (/^\s/.test(line)) continue;
      const m: any = line.match(keyPattern);
      if (!m) continue;
      const rawValue: any = m[1].trim();
      const blockMatch: any = rawValue.match(/^([>|])([+-])?\s*$/);
      if (blockMatch) {
        const style: any = blockMatch[1];
        const chomp: any = blockMatch[2];
        return readBlockScalar(lines, i + 1, style, chomp);
      }
      if (!rawValue) return;
      return stripYamlQuotes(rawValue);
    }
  }
  // UTF-16 893226..893447
  function stripYamlQuotes(value: any): any {
    const trimmed: any = value.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    )
      return trimmed.slice(1, -1);
    return trimmed;
  }
  // UTF-16 893638..894733
  function readBlockScalar(
    lines: any,
    startIdx: any,
    style: any,
    chomp: any,
  ): any {
    let baseIndent: any = -1;
    const bodyLines: any = [];
    for (let i: any = startIdx; i < lines.length; i++) {
      const line: any = lines[i];
      if (line === "") {
        bodyLines.push("");
        continue;
      }
      const indent: any = line.match(/^(\s*)/)[1].length;
      if (baseIndent === -1) {
        if (indent === 0) break;
        baseIndent = indent;
      } else if (indent < baseIndent && line.trim() !== "") break;
      bodyLines.push(line.slice(baseIndent));
    }
    while (bodyLines.length && bodyLines[0] === "") bodyLines.shift();
    while (bodyLines.length && bodyLines[bodyLines.length - 1] === "")
      bodyLines.pop();
    let result: any;
    if (style === "|") result = bodyLines.join("\n");
    else {
      const paragraphs: any = [];
      let buf: any = [];
      for (const l of bodyLines)
        if (l === "") {
          if (buf.length) {
            paragraphs.push(buf.join(" "));
            buf = [];
          }
          paragraphs.push("");
        } else buf.push(l);
      if (buf.length) paragraphs.push(buf.join(" "));
      result = paragraphs.join("\n").replace(/\n{2,}/g, "\n\n");
    }
    if (chomp === "-") result = result.replace(/\n+$/, "");
    return result;
  }
  // UTF-16 1816592..1816668
  var IMAGE_EXTENSIONS: any = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];
  // UTF-16 1816669..1816786
  var TEXT_DOCUMENT_EXTENSIONS: any = [
    "txt",
    "md",
    "json",
    "jsonl",
    "xml",
    "yaml",
    "yml",
    "csv",
    "tsv",
    "log",
  ];
  // UTF-16 1816787..1816911
  var CODE_EXTENSIONS: any = [
    "js",
    "ts",
    "jsx",
    "tsx",
    "py",
    "go",
    "java",
    "cpp",
    "c",
    "h",
    "css",
    "scss",
    "html",
  ];
  // UTF-16 1816996..1817091
  var OFFICE_DOCUMENT_EXTENSIONS: any = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ];
  // UTF-16 1817092..1817237
  var IMAGE_MIME_TYPES: any = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
  };
  // UTF-16 1817238..1817797
  var TEXT_MIME_TYPES: any = {
    txt: "text/plain",
    md: "text/markdown",
    json: "application/json",
    jsonl: "application/jsonl",
    xml: "application/xml",
    yaml: "application/x-yaml",
    yml: "application/x-yaml",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    log: "text/plain",
    js: "application/javascript",
    ts: "application/typescript",
    jsx: "text/jsx",
    tsx: "text/tsx",
    py: "text/x-python",
    go: "text/x-go",
    java: "text/x-java",
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    h: "text/x-chdr",
    css: "text/css",
    scss: "text/x-scss",
    html: "text/html",
  };
  // UTF-16 1817798..1818193
  var OFFICE_MIME_TYPES: any = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  // UTF-16 1818194..1818384
  var NETDRIVE_FILE_SIZE_LIMITS: any = {
    IMAGE_MAX_SIZE: 5 * 1024 * 1024,
    TEXT_DOCUMENT_MAX_SIZE: 10 * 1024 * 1024,
    CODE_MAX_SIZE: 1 * 1024 * 1024,
    OFFICE_DOCUMENT_MAX_SIZE: 10 * 1024 * 1024,
  };
  // UTF-16 1818385..1818637
  function normalizeExtension(input: any): any {
    const explicit: any = input.extension
      ?.replace(/^\./, "")
      .toLowerCase()
      .trim();
    if (explicit) return explicit;
    const last: any = input.name.split(".").pop();
    return last && last !== input.name ? last.toLowerCase() : "";
  }
  // UTF-16 1818638..1818712
  function isImageExtension(ext: any): any {
    return IMAGE_EXTENSIONS.includes(ext);
  }
  // UTF-16 1818713..1818802
  function isTextDocumentExtension(ext: any): any {
    return TEXT_DOCUMENT_EXTENSIONS.includes(ext);
  }
  // UTF-16 1818803..1818875
  function isCodeExtension(ext: any): any {
    return CODE_EXTENSIONS.includes(ext);
  }
  // UTF-16 1818876..1818969
  function isOfficeDocumentExtension(ext: any): any {
    return OFFICE_DOCUMENT_EXTENSIONS.includes(ext);
  }
  // UTF-16 1818970..1819087
  function sizeExceeded(size: any, maxSize: any): any {
    return typeof size === "number" && Number.isFinite(size) && size > maxSize;
  }
  // UTF-16 1819088..1819164
  function formatMb(bytes: any): any {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  }
  // UTF-16 1819165..1821126
  function classifyNetDriveItem(input: any): any {
    if (input.isFolder)
      return {
        kind: "folder",
        canSelect: true,
      };
    const extension: any = normalizeExtension(input);
    if (!extension)
      return {
        kind: "unsupported",
        canSelect: false,
        disabledReason: "暂不支持读取未知类型文件",
      };
    if (isImageExtension(extension)) {
      const maxSize: any = NETDRIVE_FILE_SIZE_LIMITS.IMAGE_MAX_SIZE;
      if (sizeExceeded(input.size, maxSize))
        return {
          kind: "image",
          extension,
          mimeType: input.mimeType || IMAGE_MIME_TYPES[extension],
          maxSize,
          canSelect: false,
          disabledReason: `图片超过 ${formatMb(maxSize)}，暂不支持选择`,
        };
      return {
        kind: "image",
        extension,
        mimeType: input.mimeType || IMAGE_MIME_TYPES[extension],
        maxSize,
        canSelect: true,
      };
    }
    if (isTextDocumentExtension(extension) || isCodeExtension(extension)) {
      const maxSize: any = isCodeExtension(extension)
        ? NETDRIVE_FILE_SIZE_LIMITS.CODE_MAX_SIZE
        : NETDRIVE_FILE_SIZE_LIMITS.TEXT_DOCUMENT_MAX_SIZE;
      if (sizeExceeded(input.size, maxSize))
        return {
          kind: "text",
          extension,
          mimeType: input.mimeType || TEXT_MIME_TYPES[extension],
          maxSize,
          canSelect: false,
          disabledReason: `文件超过 ${formatMb(maxSize)}，暂不支持选择`,
        };
      return {
        kind: "text",
        extension,
        mimeType: input.mimeType || TEXT_MIME_TYPES[extension],
        maxSize,
        canSelect: true,
      };
    }
    if (isOfficeDocumentExtension(extension)) {
      const maxSize: any = NETDRIVE_FILE_SIZE_LIMITS.OFFICE_DOCUMENT_MAX_SIZE;
      if (sizeExceeded(input.size, maxSize))
        return {
          kind: "document",
          extension,
          mimeType: input.mimeType || OFFICE_MIME_TYPES[extension],
          maxSize,
          canSelect: false,
          disabledReason: `文件超过 ${formatMb(maxSize)}，暂不支持选择`,
        };
      return {
        kind: "document",
        extension,
        mimeType: input.mimeType || OFFICE_MIME_TYPES[extension],
        maxSize,
        canSelect: true,
      };
    }
    return {
      kind: "unsupported",
      extension,
      mimeType: input.mimeType,
      canSelect: false,
      disabledReason: `暂不支持读取 .${extension} 类型文件`,
    };
  }
  // UTF-16 1821233..1821356
  function getCodebuddyMeta(meta: any): any {
    const raw: any = meta?.["codebuddy.ai"];
    return raw && typeof raw === "object" ? raw : {};
  }
  // UTF-16 1821357..1821563
  function getResourceLinks(prompt: any): any {
    return prompt.flatMap((block: any) => {
      if (block.type !== "resource_link") return [];
      return [
        {
          uri: block.uri,
          name: block.name,
          meta: block._meta,
        },
      ];
    });
  }
  // UTF-16 1821564..1821688
  function getFileResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("file://"),
    );
  }
  // UTF-16 1821689..1821819
  function getCommandResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("command://"),
    );
  }
  // UTF-16 1821820..1821942
  function getImaResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("ima://"),
    );
  }
  // UTF-16 1821943..1822073
  function getLexiangResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("lexiang://"),
    );
  }
  // UTF-16 1822074..1822208
  function getAgentMailResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("agentmail://"),
    );
  }
  // UTF-16 1822209..1822341
  function getNetDriveResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("netdrive://"),
    );
  }
  // UTF-16 1822342..1822494
  function getWechatChatHistoryResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("wechat-chat-history://"),
    );
  }
  // UTF-16 1822495..1824154
  function getAttachedNetDriveItems(prompt: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const link of getNetDriveResourceLinks(prompt)) {
      const meta: any = link.meta ?? {};
      const parsed: any = parseNetDriveUri(link.uri);
      const fileId: any = readString$2(meta.fileId);
      if (!fileId) {
        console.warn(
          "[prompt-context] netdrive resource_link missing meta.fileId, skip",
          {
            uri: link.uri,
            name: link.name,
            parsedPath: parsed?.path,
            metaKeys: Object.keys(meta),
          },
        );
        continue;
      }
      const isFolder: any =
        readBoolean(meta.isFolder) ??
        readBoolean(meta.folder) ??
        (parsed?.itemType === "folder" ||
          readString$2(meta.itemType) === "folder" ||
          readString$2(meta.type) === "folder");
      const itemType: any = isFolder ? "folder" : "file";
      const key: any = `${itemType}:${fileId.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const title: any =
        readString$2(meta.title) ??
        readString$2(meta.fileName) ??
        readString$2(meta.name) ??
        (typeof link.name === "string" && link.name ? link.name : fileId);
      const numericSize: any =
        readNumber(meta.fileSize) ?? readNumber(meta.size);
      const policy: any = classifyNetDriveItem({
        name: title,
        size: numericSize,
        isFolder,
        extension:
          readString$2(meta.extension) ??
          readString$2(meta.ext) ??
          getExtension(title),
        mimeType: readString$2(meta.mimeType) ?? readString$2(meta.mime_type),
      });
      result.push({
        fileId,
        title,
        itemType,
        kind: policy.kind,
        extension: policy.extension,
        mimeType: policy.mimeType,
        size: numericSize !== void 0 ? String(numericSize) : void 0,
        canSelect: policy.canSelect,
        disabledReason: policy.disabledReason,
      });
    }
    return result;
  }
  // UTF-16 1824155..1824780
  function parseNetDriveUri(uri: any): any {
    if (!uri.startsWith("netdrive://")) return;
    const rest: any = uri.slice(11);
    const queryIndex: any = rest.indexOf("?");
    const path: any = decodeURIComponentSafe(
      queryIndex >= 0 ? rest.slice(0, queryIndex) : rest,
    );
    const query: any = queryIndex >= 0 ? rest.slice(queryIndex + 1) : "";
    let itemType: any;
    for (const pair of query.split("&")) {
      const [rawKey, rawValue = ""] = pair.split("=");
      const key: any = decodeURIComponentSafe(rawKey);
      const value: any = decodeURIComponentSafe(rawValue);
      if (key === "type" && (value === "file" || value === "folder"))
        itemType = value;
    }
    return {
      path,
      itemType,
    };
  }
  // UTF-16 1824781..1825930
  function getAttachedImaFiles(prompt: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const link of getImaResourceLinks(prompt)) {
      const meta: any = link.meta ?? {};
      const uriParts: any = link.uri
        .slice(6)
        .split("/")
        .filter(Boolean)
        .map(decodeURIComponent);
      const fileId: any =
        readString$2(meta.fileId) ??
        readString$2(meta["ima.fileId"]) ??
        (uriParts.length >= 2 ? uriParts[1] : uriParts[0]);
      if (!fileId) continue;
      const key: any = fileId.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const kbId: any =
        readString$2(meta.kbId) ??
        readString$2(meta["ima.kbId"]) ??
        (uriParts.length >= 2 ? uriParts[0] : void 0);
      const title: any =
        readString$2(meta.title) ??
        readString$2(meta.filename) ??
        (typeof link.name === "string" && link.name ? link.name : fileId);
      result.push({
        fileId,
        kbId,
        title,
        fileType: readString$2(meta.fileType),
        itemType:
          readString$2(meta.itemType) ?? readString$2(meta["ima.itemType"]),
        kbName: readString$2(meta.kbName) ?? readString$2(meta["ima.kbName"]),
        path: readString$2(meta.path) ?? readString$2(meta["ima.path"]),
        size: readString$2(meta.size),
      });
    }
    return result;
  }
  // UTF-16 1825931..1826859
  function getAttachedLexiangFiles(prompt: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const link of getLexiangResourceLinks(prompt)) {
      const meta: any = link.meta ?? {};
      const parsedUri: any = parseLexiangUri(link.uri);
      const entityId: any = readString$2(meta.entityId) ?? parsedUri?.entityId;
      if (!entityId) continue;
      const entityType: any =
        readString$2(meta.entityType) ?? parsedUri?.entityType;
      const kbId: any = readString$2(meta.kbId) ?? parsedUri?.kbId;
      const teamId: any = readString$2(meta.teamId) ?? parsedUri?.teamId;
      const key: any = `${entityType ?? "legacy"}:${entityId.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const title: any =
        readString$2(meta.title) ??
        (typeof link.name === "string" && link.name ? link.name : entityId);
      result.push({
        entityId,
        entityType,
        kbId,
        teamId,
        title,
        url: readString$2(meta.url) ?? readString$2(meta.fileUrl),
      });
    }
    return result;
  }
  // UTF-16 1826860..1827555
  function getAttachedAgentMails(prompt: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const link of getAgentMailResourceLinks(prompt)) {
      const meta: any = link.meta ?? {};
      const messageId: any =
        readString$2(meta.message_id) ??
        readString$2(meta.id) ??
        link.uri.slice(12);
      if (!messageId || seen.has(messageId)) continue;
      seen.add(messageId);
      const title: any =
        readString$2(meta.subject) ??
        readString$2(meta.title) ??
        (typeof link.name === "string" && link.name ? link.name : messageId);
      result.push({
        messageId,
        title,
        sender: readString$2(meta.sender),
        createdAt: readString$2(meta.created_at),
        snippet: readString$2(meta.snippet),
      });
    }
    return result;
  }
  // UTF-16 1827556..1828516
  function parseLexiangUri(uri: any): any {
    if (!uri.startsWith("lexiang://")) return;
    const rest: any = uri.slice(10);
    const queryIndex: any = rest.indexOf("?");
    if (queryIndex < 0) return rest ? { entityId: rest } : void 0;
    const entityId: any = rest.slice(0, queryIndex);
    if (!entityId) return;
    const query: any = rest.slice(queryIndex + 1);
    const result: any = { entityId };
    for (const pair of query.split("&")) {
      if (!pair) continue;
      const eqIndex: any = pair.indexOf("=");
      const rawKey: any = eqIndex < 0 ? pair : pair.slice(0, eqIndex);
      const rawValue: any = eqIndex < 0 ? "" : pair.slice(eqIndex + 1);
      if (!rawKey) continue;
      let key: any = rawKey;
      let value: any = rawValue;
      try {
        key = decodeURIComponent(rawKey);
      } catch {}
      try {
        value = decodeURIComponent(rawValue);
      } catch {}
      if (key === "type" && value) result.entityType = value;
      else if (key === "kbId" && value) result.kbId = value;
      else if (key === "teamId" && value) result.teamId = value;
    }
    return result;
  }
  // UTF-16 1828598..1828715
  var TODO_TAG_KEY_WHITELIST: any = new Set([
    "agent",
    "template",
    "skill",
    "plugin",
    "scene",
    "expert",
    "locale",
  ]);
  // UTF-16 1829063..1830265
  function getAttachedTodoReferences(prompt: any): any {
    const result: any = [];
    const seen: any = /* @__PURE__ */ new Set();
    for (const block of prompt) {
      if (block.type !== "resource_link") continue;
      const meta: any = block._meta ?? {};
      if (readString$2(meta.mentionType) !== "todo") continue;
      const uri: any = typeof block.uri === "string" ? block.uri : "";
      const todoId: any = readString$2(meta.todoId) ?? parseTodoIdFromUri(uri);
      const title: any =
        readString$2(meta.todoTitle) ?? readString$2(block.name) ?? todoId;
      if (!todoId || !title) continue;
      if (seen.has(todoId)) continue;
      seen.add(todoId);
      const suggestions: any =
        readString$2(meta.todoSuggestions) ?? readString$2(meta.todoSummary);
      const workSummary: any = readString$2(meta.workSummary);
      const rawTags: any = Array.isArray(meta.todoTags) ? meta.todoTags : [];
      const tags: any = [];
      for (const t of rawTags) {
        if (typeof t !== "string" || !t) continue;
        const colonIdx: any = t.indexOf(":");
        if (colonIdx > 0 && TODO_TAG_KEY_WHITELIST.has(t.slice(0, colonIdx)))
          tags.push(t);
      }
      result.push({
        todoId,
        title,
        suggestions: suggestions || void 0,
        workSummary: workSummary || void 0,
        tags: tags.length > 0 ? tags : void 0,
      });
    }
    return result;
  }
  // UTF-16 1830266..1830411
  function parseTodoIdFromUri(uri: any): any {
    if (!uri || !uri.startsWith("todo://")) return;
    return uri.slice(7).split(/[?#]/, 1)[0]?.trim() || void 0;
  }
  // UTF-16 1830860..1831407
  function getAttachedMessageReferences(prompt: any): any {
    const result: any = [];
    for (const block of prompt) {
      if (block.type !== "resource_link") continue;
      const meta: any = block._meta ?? {};
      if (readString$2(meta.mentionType) !== "message") continue;
      const messageId: any = readString$2(meta.messageId);
      if (!messageId) continue;
      const replyId: any = readString$2(meta.replyId);
      const author: any = readString$2(meta.author);
      const snippet: any = readString$2(meta.snippet);
      result.push({
        messageId,
        replyId,
        author,
        snippet,
      });
    }
    return result;
  }
  // UTF-16 1831408..1832269
  function getAttachedSkills(prompt: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const block of prompt) {
      const candidates: any = [];
      if (block.type === "resource_link" && block.uri.startsWith("skill://"))
        candidates.push({ name: block.name || block.uri.slice(8) });
      const attachedSkill: any = block._meta?.attachedSkill;
      if (attachedSkill && typeof attachedSkill === "object") {
        const name: any =
          typeof attachedSkill.name === "string"
            ? attachedSkill.name.trim()
            : "";
        if (name) {
          const description: any =
            typeof attachedSkill.description === "string"
              ? attachedSkill.description.trim()
              : void 0;
          candidates.push({
            name,
            description,
          });
        }
      }
      for (const skill of candidates) {
        const key: any = skill.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(skill);
      }
    }
    return result;
  }
  // UTF-16 1832270..1832699
  function getFileAndFolderPaths(prompt: any): any {
    const filePaths: any = /* @__PURE__ */ new Set();
    const folderPaths: any = /* @__PURE__ */ new Set();
    for (const link of getFileResourceLinks(prompt)) {
      const localPath: any = toLocalPath(link.uri);
      if (!localPath) continue;
      if (localPath.endsWith("/")) folderPaths.add(localPath);
      else filePaths.add(localPath);
    }
    return {
      filePaths: [...filePaths],
      folderPaths: [...folderPaths],
    };
  }
  // UTF-16 1832700..1832779
  var LOCAL_FILE_MENTION_TYPES: any = new Set([
    "file",
    "folder",
    "recent-file",
  ]);
  // UTF-16 1832941..1833335
  async function resolveFileReferencePaths(
    prompt: any,
    cwd: any,
  ): Promise<any> {
    const references: any = [];
    const seen: any = /* @__PURE__ */ new Set();
    for (const block of prompt) {
      if (block.type !== "resource_link") continue;
      const localPath: any = await resolveResourceLinkLocalPath(block, cwd);
      if (localPath && !seen.has(localPath)) {
        seen.add(localPath);
        references.push(localPath);
      }
    }
    return references;
  }
  // UTF-16 1833336..1834079
  async function resolveResourceLinkLocalPath(
    block: any,
    cwd: any,
  ): Promise<any> {
    const resourceLink: any = block;
    const uri: any =
      typeof resourceLink.uri === "string" ? resourceLink.uri : "";
    const meta: any = resourceLink._meta ?? {};
    const mentionType: any =
      readString$2(meta.mentionType) ?? readString$2(meta.type);
    if (uri.startsWith("file://")) {
      if (mentionType && !LOCAL_FILE_MENTION_TYPES.has(mentionType)) return;
      return resolveLocalPath(uri, cwd, false);
    }
    if (!mentionType || !LOCAL_FILE_MENTION_TYPES.has(mentionType)) return;
    if (hasUriScheme(uri)) return;
    const candidate: any =
      readString$2(uri) ??
      readString$2(meta.filePath) ??
      readString$2(meta.relativePath) ??
      readString$2(meta.path);
    return candidate ? resolveLocalPath(candidate, cwd, false) : void 0;
  }
  // UTF-16 1834080..1834160
  function hasUriScheme(value: any): any {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
  }
  // UTF-16 1834161..1834795
  async function resolveLocalPath(
    rawPath: any,
    cwd: any,
    requireExists: any,
  ): Promise<any> {
    const cleaned: any = rawPath.trim();
    if (!cleaned) return;
    const localPath: any = cleaned.startsWith("file://")
      ? toLocalPath(cleaned)
      : cleaned;
    if (!localPath) return;
    const resolvedPath: any = node_path.isAbsolute(localPath)
      ? node_path.normalize(localPath)
      : node_path.resolve(cwd || process.cwd(), localPath);
    try {
      return (await node_fs_promises.stat(resolvedPath)).isDirectory() &&
        !resolvedPath.endsWith(node_path.sep)
        ? `${resolvedPath}${node_path.sep}`
        : resolvedPath;
    } catch (err: any) {
      if (!requireExists && err.code === "ENOENT") return resolvedPath;
      return;
    }
  }
  // UTF-16 1834796..1835002
  function getCommandPrompt(codebuddyMeta: any): any {
    const commandPrompt: any = codebuddyMeta.commandPrompt;
    return typeof commandPrompt === "string" && commandPrompt.trim().length > 0
      ? commandPrompt.trim()
      : void 0;
  }
  // UTF-16 1835003..1835233
  function getIntegrationPrompt(codebuddyMeta: any): any {
    const integrationPrompt: any = codebuddyMeta.integrationPrompt;
    return typeof integrationPrompt === "string" &&
      integrationPrompt.trim().length > 0
      ? integrationPrompt.trim()
      : void 0;
  }
  // UTF-16 1835234..1835506
  function getAutomationSystemReminder(codebuddyMeta: any): any {
    const automationSystemReminder: any =
      codebuddyMeta.automationSystemReminder;
    return typeof automationSystemReminder === "string" &&
      automationSystemReminder.trim().length > 0
      ? automationSystemReminder.trim()
      : void 0;
  }
  // UTF-16 1835950..1836137
  function getArdotFileAction(codebuddyMeta: any): any {
    const action: any = codebuddyMeta.ardotFileAction;
    return action === "create" || action === "open" || action === "ambiguous"
      ? action
      : void 0;
  }
  // UTF-16 1836325..1836491
  function getDesignStyleType(codebuddyMeta: any): any {
    const type: any = codebuddyMeta.designStyleType;
    return type === "ppt" || type === "art" || type === "ui" ? type : void 0;
  }
  // UTF-16 1836619..1836716
  function getDesignStyleUrl(codebuddyMeta: any): any {
    return readString$2(codebuddyMeta.designStyleUrl);
  }
  // UTF-16 1836756..1836851
  function getDesignStyleId(codebuddyMeta: any): any {
    return readString$2(codebuddyMeta.designStyleId);
  }
  // UTF-16 1837019..1837163
  function getImageMode(codebuddyMeta: any): any {
    const mode: any = codebuddyMeta.imageMode;
    return mode === "ai" || mode === "placeholder" ? mode : void 0;
  }
  // UTF-16 1837164..1837367
  function isPlanMode(codebuddyMeta: any, meta: any, desiredConfig: any): any {
    return (
      codebuddyMeta.mode === "plan" ||
      meta?.planMode === true ||
      desiredConfig?.permissionMode === "plan" ||
      desiredConfig?.mode === "plan"
    );
  }
  // UTF-16 1837368..1837609
  function toLocalPath(uri: any): any {
    if (!uri.startsWith("file://")) return;
    try {
      const localPath: any = (0, node_url.fileURLToPath)(uri);
      return uri.endsWith("/") && !localPath.endsWith("/")
        ? `${localPath}/`
        : localPath;
    } catch {
      return;
    }
  }
  // UTF-16 1837610..1837725
  function decodeURIComponentSafe(value: any): any {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  // UTF-16 1837726..1837926
  function readString$2(value: any): any {
    if (typeof value === "string")
      return value.trim().length > 0 ? value.trim() : void 0;
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }
  // UTF-16 1837927..1838166
  function readNumber(value: any): any {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed: any = Number(value);
      return Number.isFinite(parsed) ? parsed : void 0;
    }
  }
  // UTF-16 1838167..1838417
  function readBoolean(value: any): any {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized: any = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }
  // UTF-16 1838418..1838547
  function getExtension(name: any): any {
    const last: any = name.split(".").pop();
    return last && last !== name ? last.toLowerCase() : void 0;
  }
  // UTF-16 1838764..1840382
  function getAttachedWechatChatHistoryItems(prompt: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const link of getWechatChatHistoryResourceLinks(prompt)) {
      const meta: any = link.meta ?? {};
      const chipId: any = link.uri.slice(22).split("?")[0];
      if (!chipId || seen.has(chipId)) continue;
      const chatHistoryText: any = readString$2(meta.chatHistoryText);
      const extractedDirPath: any = readString$2(meta.extractedDirPath);
      const extractionStatus: any = readString$2(meta.extractionStatus);
      const zipPath: any = readString$2(meta.zipPath);
      if (
        !chatHistoryText ||
        !extractedDirPath ||
        !(extractionStatus === "ready" || extractionStatus === void 0)
      )
        continue;
      seen.add(chipId);
      const fileName: any =
        readString$2(meta.fileName) ??
        (typeof link.name === "string" && link.name ? link.name : chipId);
      const mediaFilesMeta: any = Array.isArray(meta.mediaFiles)
        ? meta.mediaFiles
        : [];
      const mediaFiles: any = [];
      for (const raw of mediaFilesMeta) {
        if (!raw || typeof raw !== "object") continue;
        const obj: any = raw;
        const name: any = readString$2(obj.name);
        if (!name) continue;
        const mediaPath: any = readString$2(obj.path);
        mediaFiles.push({
          name,
          size: readNumber(obj.size),
          mime: readString$2(obj.mime),
          ...(mediaPath ? { path: mediaPath } : {}),
        });
      }
      result.push({
        chipId,
        fileName,
        chatHistoryText,
        truncated: readBoolean(meta.truncated) ?? false,
        zipPath,
        extractedDirPath,
        messageCount: readNumber(meta.messageCount),
        firstSenderName: readString$2(meta.firstSenderName),
        firstMessageAt: readString$2(meta.firstMessageAt),
        mediaFiles,
      });
    }
    return result;
  }
  // UTF-16 1840526..1840726
  function readString$1(value: any): any {
    if (typeof value === "string")
      return value.trim().length > 0 ? value.trim() : void 0;
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }
  // UTF-16 1840764..1840894
  function getTencentDocResourceLinks(prompt: any): any {
    return getResourceLinks(prompt).filter((link: any) =>
      link.uri.startsWith("tdoc://"),
    );
  }
  // UTF-16 1840986..1841688
  function getAttachedTencentDocs(prompt: any): any {
    const seen: any = /* @__PURE__ */ new Set();
    const result: any = [];
    for (const link of getTencentDocResourceLinks(prompt)) {
      const meta: any = link.meta ?? {};
      const fileId: any = readString$1(meta.fileId) ?? link.uri.slice(7);
      if (!fileId) continue;
      const key: any = fileId.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const title: any =
        readString$1(meta.title) ??
        (typeof link.name === "string" && link.name ? link.name : fileId);
      result.push({
        fileId,
        title,
        fileType: readString$1(meta.fileType),
        fileExt: readString$1(meta.fileExt),
        ownerName: readString$1(meta.ownerName),
        url: readString$1(meta.fileUrl),
      });
    }
    return result;
  }
  // UTF-16 1841839..1842118
  function appendFileIdToUrl(url: any, fileId: any): any {
    if (!url || !fileId) return url;
    try {
      const parsed: any = new URL(url);
      if (parsed.searchParams.has("_fid")) return parsed.toString();
      parsed.searchParams.set("_fid", fileId);
      return parsed.toString();
    } catch {
      return url;
    }
  }
  // UTF-16 1842165..1842281
  function readString(value: any): any {
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : void 0;
  }
  // UTF-16 1842315..1842436
  function readRawSelectionString(raw: any, key: any): any {
    if (!raw || typeof raw !== "object") return;
    return readString(raw[key]);
  }
  // UTF-16 1842754..1843090
  function buildRemoteDocFromSelection(selection: any): any {
    if (!selection) return;
    const fileId: any =
      selection.fileId ??
      (selection.filePath
        ? extractTencentOnlineFileId(selection.filePath)
        : void 0);
    if (!fileId) return;
    return {
      fileId,
      title: readRawSelectionString(selection.raw, "title") ?? fileId,
      fileType: selection.fileType,
    };
  }
  // UTF-16 1843127..1843324
  function appendUniqueTencentDoc(docs: any, doc: any): any {
    if (!doc) return docs;
    if (
      docs.some(
        (existing: any) =>
          existing.fileId.toLowerCase() === doc.fileId.toLowerCase(),
      )
    )
      return docs;
    return [...docs, doc];
  }
  // UTF-16 1843371..1843533
  function getPromptBlockTypes(prompt: any): any {
    return prompt.map((block: any) => {
      const type: any = block?.type;
      return typeof type === "string" ? type : typeof block;
    });
  }
  // UTF-16 1843674..1849442
  var TencentDocsAdditionalSection: any = class TencentDocsAdditionalSection {
    [key: string]: any;
    /** 静态路由规则缓存上限；超出时淘汰最早插入的 session，避免 daemon 长运行无限增长。 */
    static MAX_ROUTING_RULES_INJECTED_SESSIONS: any = 512;
    /** 每轮都执行，让文档路由跟随最新 prompt。 */
    stage: any = "every_turn";
    /**
     * 腾讯文档只贡献 `<additional_data>` 内部片段。
     * 外层标签由 WorkbuddyUserPromptService 统一包，避免 docs section 影响 prompt XML 结构。
     */
    container: any = "additional_data";
    /**
     * 记录已注入静态路由规则的会话。
     * 动态文件/选区上下文仍每轮渲染；仅跳过重复静态规则，控制后续 prompt 体积。
     */
    routingRulesInjectedSessions: any = /* @__PURE__ */ new Set();
    /**
     * `isAiEditEnabled` 以函数注入，让灰度判断停留在 docs section 边界，
     * 不污染共享 prompt input 类型。
     */
    constructor(isAiEditEnabled: any = () => true) {
      this.isAiEditEnabled = isAiEditEnabled;
    }
    /** 每轮都尝试渲染腾讯文档路由/选区上下文（无内容时返回空串由 compose 层跳过）。 */
    shouldApply(_input: any): any {
      return true;
    }
    /** 记录 session 已注入静态路由规则；有界 Set 防止长运行内存泄漏。 */
    rememberRoutingRulesInjected(sessionId: any): any {
      if (this.routingRulesInjectedSessions.has(sessionId)) return;
      if (
        this.routingRulesInjectedSessions.size >=
        TencentDocsAdditionalSection.MAX_ROUTING_RULES_INJECTED_SESSIONS
      ) {
        const oldest: any = this.routingRulesInjectedSessions
          .values()
          .next().value;
        if (oldest) this.routingRulesInjectedSessions.delete(oldest);
      }
      this.routingRulesInjectedSessions.add(sessionId);
    }
    /**
     * 渲染当前轮次可选的腾讯文档路由和选区上下文。
     *
     * 路由服务异常时降级为仅使用 prompt 输入上下文，避免文档服务抖动阻断普通 prompt 构建。
     */
    async render(input: any): Promise<any> {
      const parts: any = [];
      let aiEditEnabled: any = false;
      try {
        aiEditEnabled = this.isAiEditEnabled();
      } catch (error: any) {
        windowLog.warn(
          "[TencentDocsRouting] resolve AI edit gate failed; skip docs routing",
          {
            sessionId: input.sessionId,
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }
      if (aiEditEnabled) {
        const { filePaths } = getFileAndFolderPaths(input.prompt);
        const textMentionedOfficeFilePaths: any =
          getTextMentionedLocalOfficeFilePaths(input.prompt);
        const textMentionedOfficeFileNames: any =
          getTextMentionedLocalOfficeFileNames(input.prompt);
        const routingFilePaths: any = mergeUniquePaths(
          filePaths,
          textMentionedOfficeFilePaths,
        );
        const promptSelections: any = getAllTencentDocsSelectionsFromPrompt(
          input.prompt,
        );
        const promptSelection: any =
          promptSelections[promptSelections.length - 1];
        const activeSelection: any = promptSelection;
        let routingContext: any;
        try {
          routingContext =
            await getTencentDocsDocumentService().buildTurnDocumentRoutingContext(
              {
                sessionId: input.sessionId,
                activeSelection,
                routingFilePaths,
                selectionFileType: promptSelection?.fileType,
              },
            );
        } catch (error: any) {
          windowLog.warn(
            "[TencentDocsRouting] buildTurnDocumentRoutingContext failed; falling back to input-only",
            {
              sessionId: input.sessionId,
              error: error instanceof Error ? error.message : String(error),
            },
          );
          routingContext = {
            activeFileContext: void 0,
            activeDocumentContext: void 0,
            activeDocumentFilePath: activeSelection?.filePath,
            activeDocumentFileId: activeSelection?.fileId,
            activeDocumentFileIdSource: activeSelection?.fileId
              ? "selection"
              : "missing",
            tencentDocsActiveDocumentFilePath: void 0,
            tencentDocsRoutingFilePaths: routingFilePaths.filter(Boolean),
            activeOnlineDocument: void 0,
            activeLocalDocument: void 0,
          };
        }
        windowLog.debug("[TencentDocsSelection] active selection for prompt", {
          sessionId: input.sessionId,
          source: promptSelection ? "prompt-block" : "none",
          filePath: activeSelection?.filePath,
          fileType: activeSelection?.fileType,
          fileId: activeSelection?.fileId,
          sourceApi: activeSelection?.sourceApi,
          hasRaw: Boolean(activeSelection?.raw),
        });
        windowLog.debug(
          "[TencentDocsRouting] local office path candidates for prompt",
          {
            sessionId: input.sessionId,
            promptBlockTypes: getPromptBlockTypes(input.prompt),
            attachedFilePaths: filePaths,
            textMentionedOfficeFilePaths,
            textMentionedOfficeFileNames,
            routingFilePaths,
            activeFilePath: routingContext.activeFileContext?.filePath,
            activeFileContextFileId: routingContext.activeFileContext?.fileId,
            activeDocumentContextFilePath:
              routingContext.activeDocumentContext?.filePath,
            activeDocumentContextFileId:
              routingContext.activeDocumentContext?.fileId,
            activeDocumentFilePath: routingContext.activeDocumentFilePath,
            activeDocumentFileId: routingContext.activeDocumentFileId,
            activeDocumentFileIdSource:
              routingContext.activeDocumentFileIdSource,
            tencentDocsActiveDocumentFilePath:
              routingContext.tencentDocsActiveDocumentFilePath,
          },
        );
        const remoteDocs: any = appendUniqueTencentDoc(
          getAttachedTencentDocs(input.prompt).map((doc: any) =>
            doc.url
              ? {
                  ...doc,
                  url: appendFileIdToUrl(doc.url, doc.fileId),
                }
              : doc,
          ),
          buildRemoteDocFromSelection(promptSelection),
        );
        const isFirstDocsRouting: any = !this.routingRulesInjectedSessions.has(
          input.sessionId,
        );
        const routingLines: any = (0,
        _tencent_tencent_docs_ai_engine.renderTencentDocsRoutingPrompt)({
          attachedFilePaths: routingContext.tencentDocsRoutingFilePaths,
          mentionedLocalOfficeFileNames: textMentionedOfficeFileNames,
          activeDocument:
            routingContext.activeOnlineDocument ??
            routingContext.activeLocalDocument,
          remoteDocs,
          includeStaticRules: isFirstDocsRouting,
        });
        if (routingLines.length > 0) {
          parts.push(...routingLines);
          if (isFirstDocsRouting)
            this.rememberRoutingRulesInjected(input.sessionId);
        }
        if (promptSelections.length > 0)
          parts.push(
            ...(0,
            _tencent_tencent_docs_ai_engine.renderTencentDocsSelectionPrompt)({
              activeSelection: {
                raw: promptSelections.map((selection: any) => selection.raw),
              },
            }),
          );
        else if (
          routingContext.activeOnlineDocument ||
          routingContext.activeLocalDocument
        )
          parts.push(
            ...(0,
            _tencent_tencent_docs_ai_engine.renderTencentDocsSelectionPrompt)(
              {},
            ),
          );
      }
      return parts.join("\n");
    }
  };
  // UTF-16 1849542..1849595
  var attachmentsBySession: any = /* @__PURE__ */ new Map();
  // UTF-16 1849596..1849669
  function normalizeFileId(fileId: any): any {
    return fileId.trim().toLowerCase();
  }
  // UTF-16 1849670..1850033
  function rememberNetDriveAttachments(sessionId: any, items: any): any {
    if (!sessionId || items.length === 0) return;
    const sessionItems: any =
      attachmentsBySession.get(sessionId) ?? /* @__PURE__ */ new Map();
    for (const item of items) {
      if (!item.fileId) continue;
      sessionItems.set(normalizeFileId(item.fileId), item);
    }
    attachmentsBySession.set(sessionId, sessionItems);
  }
  // UTF-16 1850034..1850186
  function clearNetDriveAttachments(sessionId?: any): any {
    if (sessionId) {
      attachmentsBySession.delete(sessionId);
      return;
    }
    attachmentsBySession.clear();
  }
  // UTF-16 1850288..1850322
  var MAX_EXPERT_PROMPT_CHARS: any = 2e4;
  // UTF-16 1850323..1850392
  var EXPERT_SELECTION_BLOCK_META_KEY: any = "codebuddy.ai/expertSelection";
  // UTF-16 1850393..1850515
  function readNonEmptyString$1(value: any): any {
    return typeof value === "string" && value.trim() !== ""
      ? value.trim()
      : void 0;
  }
  // UTF-16 1850516..1850775
  function readExpertSelectionIdentity(value: any): any {
    if (!value || typeof value !== "object") return;
    const record: any = value;
    const id: any = readNonEmptyString$1(record.id);
    if (!id) return;
    return {
      id,
      marketplace: readNonEmptyString$1(record.marketplace),
    };
  }
  // UTF-16 1850776..1850914
  function isSameExpertSelection(current: any, previous: any): any {
    return (
      current.id === previous?.id &&
      current.marketplace === previous.marketplace
    );
  }
  // UTF-16 1850915..1851080
  function escapeXmlText$2(value: any): any {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
  // UTF-16 1851081..1851528
  function readExpertDisplayName(
    codebuddyMeta: any,
    expertId: any,
    fallback: any,
  ): any {
    for (const key of ["expertSelection", "expert"]) {
      const candidate: any = codebuddyMeta[key];
      if (!candidate || typeof candidate !== "object") continue;
      const record: any = candidate;
      const candidateId: any = readNonEmptyString$1(record.id);
      const name: any = readNonEmptyString$1(record.name);
      if ((!candidateId || candidateId === expertId) && name) return name;
    }
    return fallback;
  }
  // UTF-16 1851529..1851937
  function renderCancelledSelection(): any {
    return [
      "<system-reminder>",
      '<expert_selection state="cancelled">',
      "The user has cancelled the expert selection.",
      "Immediately stop using the previously injected expert role and workflow, disregard all previously injected expert instructions, and revert to your default role and behavior.",
      "</expert_selection>",
      "</system-reminder>",
    ].join("\n");
  }
  // UTF-16 1851938..1853425
  async function renderExpertSelectionReminder(
    input: any,
    expertPluginService: any,
  ): Promise<any> {
    const currentExpertId: any =
      readNonEmptyString$1(input.desiredConfig?.expertId) ??
      readNonEmptyString$1(input.codebuddyMeta.expertId);
    const previousSelection: any = readExpertSelectionIdentity(
      input.codebuddyMeta.previousExpertSelection,
    );
    if (!currentExpertId)
      return previousSelection ? renderCancelledSelection() : void 0;
    const marketplace: any = readNonEmptyString$1(
      input.desiredConfig?.expertMarketplace,
    );
    if (
      isSameExpertSelection(
        {
          id: currentExpertId,
          marketplace,
        },
        previousSelection,
      ) ||
      !expertPluginService
    )
      return;
    try {
      const source: any =
        await expertPluginService.resolveExpertAgentPromptSource(
          currentExpertId,
          marketplace,
        );
      if (!source) return;
      const { agentName, filePath: promptPath } = source;
      const fullPrompt: any = await node_fs_promises.readFile(
        promptPath,
        "utf8",
      );
      if (!fullPrompt.trim()) return;
      const prompt: any = fullPrompt.slice(0, MAX_EXPERT_PROMPT_CHARS);
      return [
        "<system-reminder>",
        '<expert_selection state="active">',
        "",
        `The user has selected the "${escapeXmlText$2(readExpertDisplayName(input.codebuddyMeta, currentExpertId, agentName))}" expert. The following are the complete expert instructions.`,
        "",
        "Expert plugin path:",
        promptPath,
        "",
        prompt,
        ...(fullPrompt.length > 2e4
          ? ["", `too long, see the full content at ${promptPath}`]
          : []),
        "",
        "</expert_selection>",
        "</system-reminder>",
      ].join("\n");
    } catch {
      return;
    }
  }
  // UTF-16 1853505..1853599
  function escapeXmlAttribute(value: any): any {
    return escapeXmlText$1(value).replace(/"/g, "&quot;");
  }
  // UTF-16 1853600..1853717
  function escapeXmlText$1(value: any): any {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  // UTF-16 1854000..1854051
  var BUILTIN_DEFAULT_CONNECTOR: any = "netdrive__tdrive";
  // UTF-16 1854052..1855097
  var IMA_USAGE_INSTRUCTIONS: any = [
    'The user has attached files and knowledge bases from IMA, referenced in the message as `@ima:<ref>`. Metadata is listed in the `<references>` block as `<file id="..." kb_id="..." title="..." media_type="..." item_type="file" kb_name="..." path="..." />` or `<knowledge_base id="..." kb_id="..." title="..." item_type="kb" />`.',
    "To read an attached IMA file, find the matching `<file>` in `<references>` by title or id, then use the IMA MCP tool from connector `ima-mcp` with its `id` as `file_id` and `kb_id` when required.",
    "To use an attached IMA knowledge base, find the matching `<knowledge_base>` in `<references>` by title or id, then use the IMA MCP tool from connector `ima-mcp` with its `kb_id` to search or retrieve relevant content.",
    "These are remote IMA resources, not local workspace files. Always use the IMA MCP tool — never Read/Glob/Grep/Bash. If the IMA MCP connector is unavailable, ask the user to enable IMA instead of falling back to local file operations.",
  ];
  // UTF-16 1855098..1856003
  function renderImaUsage(files: any): any {
    const lines: any = [
      "<ima_usage>",
      ...IMA_USAGE_INSTRUCTIONS,
      "<references>",
    ];
    for (const file of files) {
      const attrs: any = [
        `id="${escapeXmlAttribute(file.fileId)}"`,
        `title="${escapeXmlAttribute(file.title)}"`,
      ];
      if (file.kbId) attrs.push(`kb_id="${escapeXmlAttribute(file.kbId)}"`);
      if (file.fileType)
        attrs.push(`media_type="${escapeXmlAttribute(file.fileType)}"`);
      if (file.itemType)
        attrs.push(`item_type="${escapeXmlAttribute(file.itemType)}"`);
      if (file.kbName)
        attrs.push(`kb_name="${escapeXmlAttribute(file.kbName)}"`);
      if (file.path) attrs.push(`path="${escapeXmlAttribute(file.path)}"`);
      if (file.size) attrs.push(`size="${escapeXmlAttribute(file.size)}"`);
      const tagName: any = file.itemType === "kb" ? "knowledge_base" : "file";
      lines.push(`<${tagName} ${attrs.join(" ")} />`);
    }
    lines.push("</references>", "</ima_usage>");
    return lines;
  }
  // UTF-16 1856448..1857442
  var LEXIANG_USAGE_INSTRUCTIONS: any = [
    'The user has attached resources from Tencent Lexiang, referenced in the message as `@lexiang:"<title>"`. Metadata for these resources is listed in the `<references>` block as `<item id="..." title="..." entity_type="doc|kb|folder|team" kb_id="..." team_id="..." url="..." />`.',
    'To use an attached `@lexiang:"<title>"` resource, find the matching `<item>` in `<references>` by `title`, then call the Lexiang MCP tool from connector `lexiang-ol` with its `id` as `entity_id` (and `kb_id` / `team_id` when required). The `entity_type` tells you which sub-tool to call: `doc` for a single document, `kb` for a whole knowledge base, `folder` for a folder, `team` for a team workspace.',
    "These are remote Tencent Lexiang resources, not local workspace files. Always use the `lexiang-ol` MCP connector — never Read/Glob/Grep/Bash. If the connector is unavailable, ask the user to enable it instead of falling back to local file operations.",
  ];
  // UTF-16 1858053..1858388
  var WORKBUDDY_FILE_HANDLING_INSTRUCTIONS: any = [
    "",
    "<file_handling>",
    "- Default to local workspace for files/artifacts; use `tdrive` only for explicit netdrive/Tencent-drive requests, unless the user explicitly asks for another netdrive.",
    "- Upload artifacts to netdrive only when the user explicitly asks.",
    "</file_handling>",
  ];
  // UTF-16 1858389..1858482
  function renderWorkBuddyFileHandling(): any {
    return [...WORKBUDDY_FILE_HANDLING_INSTRUCTIONS];
  }
  // UTF-16 1858483..1859175
  function renderLexiangUsage(items: any): any {
    const lines: any = [
      "<lexiang_usage>",
      ...LEXIANG_USAGE_INSTRUCTIONS,
      "<references>",
    ];
    for (const item of items) {
      const attrs: any = [
        `id="${escapeXmlAttribute(item.entityId)}"`,
        `title="${escapeXmlAttribute(item.title)}"`,
      ];
      if (item.entityType)
        attrs.push(`entity_type="${escapeXmlAttribute(item.entityType)}"`);
      if (item.kbId) attrs.push(`kb_id="${escapeXmlAttribute(item.kbId)}"`);
      if (item.teamId)
        attrs.push(`team_id="${escapeXmlAttribute(item.teamId)}"`);
      if (item.url) attrs.push(`url="${escapeXmlAttribute(item.url)}"`);
      lines.push(`<item ${attrs.join(" ")} />`);
    }
    lines.push("</references>", "</lexiang_usage>");
    return lines;
  }
  // UTF-16 1859176..1859673
  var AGENT_MAIL_USAGE_INSTRUCTIONS: any = [
    'The user has attached Agent Mail messages, referenced in the message as `@agentmail:"<title>"`.',
    'Metadata for these messages is listed in the `<references>` block as `<mail message_id="..." title="..." sender="..." created_at="..." snippet="..." />`.',
    "To read the full email body or attachments, use the available Agent Mail MCP capability with the matching `message_id`. Do not assume the full content from the title or snippet alone.",
  ];
  // UTF-16 1859674..1860321
  function renderAgentMailUsage(items: any): any {
    const lines: any = [
      "<agent_mail_usage>",
      ...AGENT_MAIL_USAGE_INSTRUCTIONS,
      "<references>",
    ];
    for (const item of items) {
      const attrs: any = [
        `message_id="${escapeXmlAttribute(item.messageId)}"`,
        `title="${escapeXmlAttribute(item.title)}"`,
      ];
      if (item.sender)
        attrs.push(`sender="${escapeXmlAttribute(item.sender)}"`);
      if (item.createdAt)
        attrs.push(`created_at="${escapeXmlAttribute(item.createdAt)}"`);
      if (item.snippet)
        attrs.push(`snippet="${escapeXmlAttribute(item.snippet)}"`);
      lines.push(`<mail ${attrs.join(" ")} />`);
    }
    lines.push("</references>", "</agent_mail_usage>");
    return lines;
  }
  // UTF-16 1861070..1861363
  function renderNetdriveRoot(root: any): any {
    const attrs: any = [`id="${escapeXmlAttribute(root.fileId)}"`];
    if (root.dirName)
      attrs.push(`dir_name="${escapeXmlAttribute(root.dirName)}"`);
    attrs.push(`scope="${root.projectId ? "project" : "personal"}"`);
    return [`<tdrive-root ${attrs.join(" ")} />`];
  }
  // UTF-16 1861604..1861996
  function renderConnectorStatusBlock(entries: any): any {
    if (!entries || entries.length === 0) return [];
    return [
      "<connector-status>",
      ...entries.map((entry: any) => {
        const displayName: any =
          entry.configId === BUILTIN_DEFAULT_CONNECTOR
            ? `${entry.displayName} (built-in default)`
            : entry.displayName;
        return `${entry.configId} ${displayName}: ${entry.status}`;
      }),
      "</connector-status>",
    ];
  }
  // UTF-16 1862331..1862577
  var NETDRIVE_USAGE_HEADER: any =
    "The user has attached Tencent NetDrive resources as `netdrive://`, with metadata in the block below. Look up each `id` there and call the `netdrive__tdrive` MCP — never use Read/Glob/Grep/Bash on `netdrive://` URIs.";
  // UTF-16 1863167..1863923
  var WECHAT_CHAT_HISTORY_INSTRUCTIONS: any = [
    "The user has attached a WeChat chat-history zip via the WeChat share entry. The transcript text is inlined below; files from the zip were pre-extracted to `extracted_dir_path`.",
    "When the user asks about people, time, references, or media in the chat, use the inlined transcript as the primary source. If the transcript is truncated, read the pre-extracted `聊天记录.txt` from `extracted_dir_path` instead of extracting the zip yourself.",
    "For images/videos/docs referenced in the transcript, use the `path` attributes in `<media_files>` if provided; otherwise use Glob within `extracted_dir_path` to locate the file. Do not use Bash unzip on the original zip. Never assume content of media you have not read.",
  ];
  // UTF-16 1863924..1865363
  function renderWechatChatHistory(items: any): any {
    const validItems: any = items.filter((item: any) => item.extractedDirPath);
    if (validItems.length === 0) return [];
    const lines: any = [
      "<wechat_chat_history>",
      ...WECHAT_CHAT_HISTORY_INSTRUCTIONS,
    ];
    for (const item of validItems) {
      const attrs: any = [
        `file="${escapeXmlAttribute(item.fileName)}"`,
        `extracted_dir_path="${escapeXmlAttribute(item.extractedDirPath)}"`,
      ];
      if (typeof item.messageCount === "number")
        attrs.push(`messages="${item.messageCount}"`);
      if (item.firstSenderName)
        attrs.push(
          `first_sender="${escapeXmlAttribute(item.firstSenderName)}"`,
        );
      if (item.firstMessageAt)
        attrs.push(
          `first_message_at="${escapeXmlAttribute(item.firstMessageAt)}"`,
        );
      if (item.truncated) attrs.push('truncated="true"');
      lines.push(`<transcript ${attrs.join(" ")}>`);
      lines.push(escapeXmlText$1(item.chatHistoryText));
      lines.push("</transcript>");
      if (item.mediaFiles.length > 0) {
        lines.push("<media_files>");
        for (const media of item.mediaFiles) {
          const mAttrs: any = [`name="${escapeXmlAttribute(media.name)}"`];
          if (typeof media.size === "number")
            mAttrs.push(`size="${media.size}"`);
          if (media.mime)
            mAttrs.push(`mime="${escapeXmlAttribute(media.mime)}"`);
          if (media.path)
            mAttrs.push(`path="${escapeXmlAttribute(media.path)}"`);
          lines.push(`<media ${mAttrs.join(" ")} />`);
        }
        lines.push("</media_files>");
      }
    }
    lines.push("</wechat_chat_history>");
    return lines;
  }
  // UTF-16 1865528..1865777
  var TODO_REFERENCE_HEADER: any =
    "The user has attached project todos below. MUST call `todo_show` with the id to fetch full details. suggestions carries advice from the previous handler — for reference only, always prioritize the current user's query.";
  // UTF-16 1866152..1866816
  function renderTodoReferenceXml(items: any): any {
    if (!items || items.length === 0) return [];
    const lines: any = ["<todo-reference>", TODO_REFERENCE_HEADER];
    for (const entry of items) {
      const id: any = escapeXmlAttribute(entry.todoId);
      const title: any = escapeXmlAttribute(entry.title);
      const suggestions: any = (entry.suggestions ?? "").trim();
      if (suggestions) {
        lines.push(`<todo id="${id}" title="${title}">`);
        lines.push("  <suggestions>");
        lines.push(`  ${escapeXmlText$1(suggestions)}`);
        lines.push("  </suggestions>");
        lines.push("</todo>");
      } else lines.push(`<todo id="${id}" title="${title}" />`);
    }
    lines.push("</todo-reference>");
    return lines;
  }
  // UTF-16 1866992..1867209
  var MESSAGE_REFERENCE_HEADER: any =
    "The user has attached project messages below. MUST call `project_message_show` with the id to fetch full details. See <user_query> for which specific message the user is asking about.";
  // UTF-16 1867790..1868765
  function renderMessageReferenceXml(items: any): any {
    if (!items || items.length === 0) return [];
    const seen: any = /* @__PURE__ */ new Set();
    const uniq: any = [];
    for (const item of items) {
      const messageId: any =
        typeof item.messageId === "string" ? item.messageId.trim() : "";
      if (!messageId) continue;
      const key: any = `${messageId}\u0000${item.replyId ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(item);
    }
    if (uniq.length === 0) return [];
    const lines: any = ["<message-reference>", MESSAGE_REFERENCE_HEADER];
    for (const entry of uniq) {
      const attrs: any = [
        `id="${escapeXmlAttribute(entry.replyId?.trim() || entry.messageId)}"`,
      ];
      const author: any = (entry.author ?? "").trim();
      if (author) attrs.push(`author="${escapeXmlAttribute(author)}"`);
      const snippet: any = (entry.snippet ?? "").trim();
      if (snippet) attrs.push(`snippet="${escapeXmlAttribute(snippet)}"`);
      lines.push(`<message ${attrs.join(" ")} />`);
    }
    lines.push("</message-reference>");
    return lines;
  }
  // UTF-16 1869388..1869798
  function renderNetDriveAttachments(items: any): any {
    const lines: any = ["<tdrive_attachments>", NETDRIVE_USAGE_HEADER];
    for (const item of items) {
      const attrs: any = [
        `id="${escapeXmlAttribute(item.fileId)}"`,
        `title="${escapeXmlAttribute(item.title)}"`,
        `item_type="${escapeXmlAttribute(item.itemType)}"`,
      ];
      lines.push(`<file ${attrs.join(" ")} />`);
    }
    lines.push("</tdrive_attachments>");
    return lines;
  }
  // UTF-16 1869799..1872126
  var AdditionalDataSection: any = class {
    [key: string]: any;
    /** 每轮输出 current_time、附件和连接器状态等通用上下文。 */
    stage: any = "every_turn";
    /**
     * 只返回 `<additional_data>` 内部内容；外层标签由 WorkbuddyUserPromptService 统一包一次。
     * 业务专属内容请放到自己的 section，并复用同一个 container 标记接入。
     */
    container: any = "additional_data";
    shouldApply(): any {
      return true;
    }
    async render(input: any): Promise<any> {
      const { filePaths, folderPaths } = getFileAndFolderPaths(input.prompt);
      const parts: any = [
        "<current_time>",
        new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZoneName: "short",
        }).format(/* @__PURE__ */ new Date()),
        "</current_time>",
      ];
      if (
        !input.isTeamsProject &&
        input.connectorStatus &&
        input.connectorStatus.length > 0
      )
        parts.push("", ...renderConnectorStatusBlock(input.connectorStatus));
      const netDriveItems: any = getAttachedNetDriveItems(input.prompt);
      const hasNetDriveContext: any =
        Boolean(input.netdriveRoot) || netDriveItems.length > 0;
      if (!input.isTeamsProject && hasNetDriveContext)
        parts.push(...renderWorkBuddyFileHandling());
      if (!input.isTeamsProject && input.netdriveRoot?.fileId)
        parts.push(...renderNetdriveRoot(input.netdriveRoot));
      if (folderPaths.length > 0)
        parts.push(
          "<attached_folders>",
          ...folderPaths.map(
            (folderPath: any) =>
              `<folder path="${escapeXmlAttribute(folderPath)}" />`,
          ),
          "</attached_folders>",
        );
      if (filePaths.length > 0)
        parts.push(
          "<attached_files>",
          ...filePaths.map(
            (filePath: any) =>
              `<file path="${escapeXmlAttribute(filePath)}" />`,
          ),
          "</attached_files>",
        );
      const imaFiles: any = getAttachedImaFiles(input.prompt);
      if (imaFiles.length > 0) parts.push(...renderImaUsage(imaFiles));
      const lexiangItems: any = getAttachedLexiangFiles(input.prompt);
      if (lexiangItems.length > 0)
        parts.push(...renderLexiangUsage(lexiangItems));
      const agentMails: any = getAttachedAgentMails(input.prompt);
      if (agentMails.length > 0)
        parts.push(...renderAgentMailUsage(agentMails));
      if (!input.isTeamsProject && netDriveItems.length > 0)
        parts.push(...renderNetDriveAttachments(netDriveItems));
      const wechatChatHistoryItems: any = getAttachedWechatChatHistoryItems(
        input.prompt,
      );
      if (wechatChatHistoryItems.length > 0)
        parts.push(...renderWechatChatHistory(wechatChatHistoryItems));
      return parts.join("\n");
    }
  };
  // UTF-16 1873275..1874169
  var ArdotDesignStyleSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return (
        getDesignStyleType(input.codebuddyMeta) !== void 0 &&
        getDesignStyleUrl(input.codebuddyMeta) !== void 0
      );
    }
    async render(input: any): Promise<any> {
      const type: any = getDesignStyleType(input.codebuddyMeta);
      const url: any = getDesignStyleUrl(input.codebuddyMeta);
      if (!type || !url) return;
      const id: any = getDesignStyleId(input.codebuddyMeta);
      const filename: any = extractFilename(url);
      const attrs: any = [`type="${escapeAttr(type)}"`];
      if (id) attrs.push(`id="${escapeAttr(id)}"`);
      attrs.push(`url="${escapeAttr(url)}"`);
      return [
        `<ardot_design_style ${attrs.join(" ")}>`,
        `[style-template] user selected template ${filename}, use \`curl ${url}\` to fetch template contents, use this template style and skip search_style_guide/build_style_guide. [/style-template]`,
        "</ardot_design_style>",
      ].join("\n");
    }
  };
  // UTF-16 1874386..1874523
  function extractFilename(url: any): any {
    const idx: any = url.lastIndexOf("/");
    return idx >= 0 && idx < url.length - 1 ? url.slice(idx + 1) : url;
  }
  // UTF-16 1874658..1874818
  function escapeAttr(value: any): any {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
  // UTF-16 1876164..1876641
  var ArdotFileDirectiveSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return (
        isCraftMode(input.codebuddyMeta) &&
        getArdotFileAction(input.codebuddyMeta) !== void 0
      );
    }
    async render(input: any): Promise<any> {
      if (!isCraftMode(input.codebuddyMeta)) return;
      const action: any = getArdotFileAction(input.codebuddyMeta);
      if (!action) return;
      return [
        `<ardot_file_directive action="${action}">`,
        renderInstruction(action),
        "</ardot_file_directive>",
      ].join("\n");
    }
  };
  // UTF-16 1876843..1876961
  function isCraftMode(codebuddyMeta: any): any {
    const mode: any = codebuddyMeta.mode;
    return mode === void 0 || mode === "craft";
  }
  // UTF-16 1877045..1878359
  function renderInstruction(action: any): any {
    switch (action) {
      case "create":
        return 'A new blank Ardot design file MUST be created for this task. Call create_design EXACTLY ONCE as your first canvas action, then NEVER call create_design again this turn. Do NOT re-run the Step 0 create/open decision tree, and do NOT call create_design a second time to "make sure" the file exists — once issued, treat the file as being created and proceed (use fetch_file_info if you need the file id).';
      case "open":
        return "The user referenced an existing Ardot design file. Call open_design EXACTLY ONCE with the provided file URL/ID, then proceed. Do NOT call create_design for this task, and do NOT re-run the Step 0 create/open decision tree.";
      case "ambiguous":
        return 'The user used a "create/make" verb, but the request has no clear design intent (no design artifact like poster/page/slides, no design template scene, no reference image). Do NOT call create_design and do NOT create any blank design file yet. First, briefly ask the user to confirm what they want: are they asking you to create a new Ardot design file, or is this a non-design request (e.g. creating an issue, a document, running a task)? Only proceed to create_design after the user confirms they want a new design file.';
      default:
        return "";
    }
  }
  // UTF-16 1879192..1879476
  var ArdotImageGenSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return getImageMode(input.codebuddyMeta) !== void 0;
    }
    async render(input: any): Promise<any> {
      const mode: any = getImageMode(input.codebuddyMeta);
      if (!mode) return;
      return `<ardot_image_gen mode="${mode}" />`;
    }
  };
  // UTF-16 1879585..1879657
  var INSTRUCTION: any = "Please use the use_skill tool to invoke this skill.";
  // UTF-16 1879658..1880252
  var AttachedSkillsSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return getAttachedSkills(input.prompt).length > 0;
    }
    async render(input: any): Promise<any> {
      const skills: any = getAttachedSkills(input.prompt);
      if (skills.length === 0) return;
      const lines: any = ["<manually_attached_skills>", INSTRUCTION];
      for (const skill of skills) {
        lines.push(`name: ${skill.name}`);
        if (skill.description) lines.push(`description: ${skill.description}`);
        lines.push("");
      }
      while (lines.at(-1) === "") lines.pop();
      lines.push("</manually_attached_skills>");
      return lines.join("\n");
    }
  };
  // UTF-16 1880372..1880621
  var AutomationSystemReminderSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return Boolean(getAutomationSystemReminder(input.codebuddyMeta));
    }
    async render(input: any): Promise<any> {
      return getAutomationSystemReminder(input.codebuddyMeta);
    }
  };
  // UTF-16 1880738..1880843
  function readNonEmptyString(raw: any): any {
    return typeof raw === "string" && raw.trim() !== "" ? raw : void 0;
  }
  // UTF-16 1880844..1880959
  function escapeXmlText(value: any): any {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  // UTF-16 1880960..1881087
  function readExpertTypeLabel(raw: any): any {
    if (raw === "expert_team") return "专家团";
    if (raw === "expert") return "专家";
    return "";
  }
  // UTF-16 1881579..1882432
  var CurrentExpertReminderSection: any = class {
    [key: string]: any;
    id: any = "current_expert_reminder";
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return this.resolveExpertId(input) !== void 0;
    }
    async render(input: any): Promise<any> {
      const expertId: any = this.resolveExpertId(input);
      if (!expertId) return;
      const name: any =
        readNonEmptyString(input.codebuddyMeta.expertName) ?? expertId;
      const typeLabel: any = readExpertTypeLabel(
        input.codebuddyMeta.expertType,
      );
      return [
        "<current-expert>",
        `当前会话已选择 Expert「${typeLabel ? `${escapeXmlText(name)}」${typeLabel}` : `${escapeXmlText(name)}」`}。请遵循该 Expert 的角色与工作流。`,
        "禁止读取 recommend-experts，也不要调用 suggest_plugin_install 提交 expert 分组；Connector 推荐可正常进行。",
        "</current-expert>",
      ].join("\n");
    }
    resolveExpertId(input: any): any {
      return (
        readNonEmptyString(input.codebuddyMeta.expertId) ??
        readNonEmptyString(input.desiredConfig?.expertId)
      );
    }
  };
  // UTF-16 1882542..1883046
  var IdentityContextSection: any = class {
    [key: string]: any;
    stage: any = "first_turn";
    constructor(systemPromptService: any) {
      this.systemPromptService = systemPromptService;
    }
    shouldApply(input: any): any {
      return input.codebuddyMeta.alreadyInjectedUserContext !== true;
    }
    async render(input: any): Promise<any> {
      return (
        (await this.systemPromptService.renderUserContext({
          mode: input.desiredConfig?.mode,
          expertId: input.desiredConfig?.expertId,
          expertMarketplace: input.desiredConfig?.expertMarketplace,
          cwd: input.cwd,
        })) || void 0
      );
    }
  };
  // UTF-16 1883133..1883360
  var TEMPLATE_NAMES: any = {
    normal: "workbuddy-prompt.tpl",
    expert: "workbuddy-expert-prompt.tpl",
    systemReminder: "system-reminder.tpl",
    askModeReminder: "ask-mode-reminder.tpl",
    craftModeReminder: "craft-mode-reminder.tpl",
  };
  // UTF-16 1883361..1883510
  async function loadSystemReminderTemplate(): Promise<any> {
    return (0, node_fs_promises.readFile)(
      requirePromptTemplate(TEMPLATE_NAMES.systemReminder),
      "utf8",
    );
  }
  // UTF-16 1883511..1883725
  async function loadModeTransitionReminderTemplate(mode: any): Promise<any> {
    return (0, node_fs_promises.readFile)(
      requirePromptTemplate(
        mode === "ask"
          ? TEMPLATE_NAMES.askModeReminder
          : TEMPLATE_NAMES.craftModeReminder,
      ),
      "utf8",
    );
  }
  // UTF-16 1883726..1883816
  function requirePromptTemplate(name: any): any {
    return requireWorkbuddyPromptTemplatePath(name);
  }
  // UTF-16 1883934..1884027
  function readTransitionMode(raw: any): any {
    return raw === "ask" || raw === "craft" ? raw : void 0;
  }
  // UTF-16 1884406..1885060
  var ModeTransitionReminderSection: any = class {
    [key: string]: any;
    id: any = "mode_transition_reminder";
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return this.hasModeTransition(input);
    }
    async render(input: any): Promise<any> {
      const current: any = readTransitionMode(input.codebuddyMeta.mode);
      if (!current || !this.hasModeTransition(input)) return;
      return loadModeTransitionReminderTemplate(current);
    }
    hasModeTransition(input: any): any {
      const current: any = readTransitionMode(input.codebuddyMeta.mode);
      if (!current) return false;
      const previous: any = input.codebuddyMeta.previousMode;
      if (typeof previous !== "string" || previous.length === 0) return false;
      return previous !== current;
    }
  };
  // UTF-16 1885169..1885252
  var GUIDANCE_FILES: any = [
    "CODEBUDDY.md",
    ".codebuddy/CODEBUDDY.md",
    "AGENTS.md",
  ];
  // UTF-16 1885253..1885282
  var MAX_GUIDANCE_CHARS: any = 8e3;
  // UTF-16 1885283..1885311
  var MAX_LAYOUT_ENTRIES: any = 40;
  // UTF-16 1885312..1885338
  var MAX_SUBTREE_DEPTH: any = 6;
  // UTF-16 1885339..1885366
  var MAX_TOP_EXTENSIONS: any = 5;
  // UTF-16 1885367..1885953
  var ProjectContextSection: any = class {
    [key: string]: any;
    stage: any = "first_turn";
    shouldApply(input: any): any {
      if (input.codebuddyMeta.alreadyInjectedUserContext === true) return false;
      return typeof input.cwd === "string" && input.cwd.trim().length > 0;
    }
    async render(input: any): Promise<any> {
      const cwd: any = input.cwd?.trim();
      if (!cwd) return;
      const guidance: any = await readProjectGuidance(cwd);
      const layout: any = await readProjectLayout(cwd);
      if (!guidance && !layout) return;
      return [
        "<project_context>",
        ...(guidance ? [guidance] : []),
        ...(layout ? [layout] : []),
        "</project_context>",
      ].join("\n");
    }
  };
  // UTF-16 1885954..1886465
  async function readProjectGuidance(cwd: any): Promise<any> {
    for (const candidate of GUIDANCE_FILES) {
      const target: any = node_path.join(cwd, candidate);
      try {
        const raw: any = await node_fs_promises.readFile(target, "utf8");
        return wrapXmlTextElement(
          "project_guidance",
          `The project guidance below is generated by the CodeBuddy IDE's AI...\nFile: ${target}\n${(raw.length > MAX_GUIDANCE_CHARS ? `${raw.slice(0, MAX_GUIDANCE_CHARS)}\n[...too long, omitted...]` : raw).trimEnd()}`,
        );
      } catch {
        continue;
      }
    }
    return "";
  }
  // UTF-16 1886466..1887424
  async function readProjectLayout(cwd: any): Promise<any> {
    try {
      const entries: any = await node_fs_promises.readdir(cwd, {
        withFileTypes: true,
      });
      const visibleEntries: any = entries
        .filter((entry: any) => !entry.name.startsWith("."))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
        .slice(0, MAX_LAYOUT_ENTRIES);
      const entryLines: any = [];
      for (const entry of visibleEntries)
        if (entry.isDirectory()) {
          const subtreeSummary: any = await summarizeSubtree(
            node_path.join(cwd, entry.name),
          );
          entryLines.push(`- ${entry.name}/`);
          if (subtreeSummary) entryLines.push(subtreeSummary);
        } else entryLines.push(`- ${entry.name}`);
      if (
        entries.filter((e: any) => !e.name.startsWith(".")).length >
        MAX_LAYOUT_ENTRIES
      )
        entryLines.push("- ...");
      return [
        "<project_layout>",
        "Below is a snapshot of the current workspace's file structure...",
        `${cwd}${cwd.endsWith(node_path.sep) ? "" : node_path.sep}`,
        ...entryLines,
        "</project_layout>",
      ].join("\n");
    } catch {
      return "";
    }
  }
  // UTF-16 1887425..1888389
  async function summarizeSubtree(dirPath: any): Promise<any> {
    const extCounts: any = /* @__PURE__ */ new Map();
    let totalFiles: any = 0;
    async function walk(dir: any, depth: any): Promise<any> {
      if (depth > MAX_SUBTREE_DEPTH) return;
      let entries: any;
      try {
        entries = await node_fs_promises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        if (entry.isDirectory())
          await walk(node_path.join(dir, entry.name), depth + 1);
        else if (entry.isFile()) {
          totalFiles++;
          const ext: any = node_path.extname(entry.name);
          if (ext) extCounts.set(ext, (extCounts.get(ext) ?? 0) + 1);
        }
      }
    }
    await walk(dirPath, 1);
    if (totalFiles === 0) return;
    const topExts: any = [...extCounts.entries()]
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, MAX_TOP_EXTENSIONS)
      .map(([ext, count]: any) => `${count} *${ext}`)
      .join(", ");
    return `  ${topExts ? `[${totalFiles} files in subtree: ${topExts}]` : `[${totalFiles} files in subtree]`}`;
  }
  // UTF-16 1888488..1889375
  var RulesSection: any = class {
    [key: string]: any;
    stage: any = "first_turn";
    shouldApply(input: any): any {
      const rules: any = input.codebuddyMeta.scenarioRules;
      return typeof rules === "string" && rules.trim().length > 0;
    }
    async render(input: any): Promise<any> {
      const rules: any = input.codebuddyMeta.scenarioRules;
      if (typeof rules !== "string" || rules.trim().length === 0) return;
      return [
        "<rules>",
        "The rules section has a number of possible rules/memories/context that you should consider. In each subsection, we provide instructions about what information the subsection contains and how you should consider/follow the contents of the subsection.",
        "",
        '<always_applied_user_rules description="These are rules set by the user that you should follow if appropriate.">',
        "- <system_reminder>",
        rules.trim(),
        "</system_reminder>",
        "",
        "</always_applied_user_rules>",
        "</rules>",
      ].join("\n");
    }
  };
  // UTF-16 1889489..1890239
  var SpecialInstructionsSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return Boolean(
        getCommandPrompt(input.codebuddyMeta) ||
          getIntegrationPrompt(input.codebuddyMeta),
      );
    }
    async render(input: any): Promise<any> {
      const commandPrompt: any = getCommandPrompt(input.codebuddyMeta);
      const integrationPrompt: any = getIntegrationPrompt(input.codebuddyMeta);
      if (!commandPrompt && !integrationPrompt) return;
      return [
        "<user_special_instructions>",
        "Please refer to the instructions below to complete the user's task.",
        ...(commandPrompt
          ? [wrapXmlTextElement("command_prompt", commandPrompt)]
          : []),
        ...(integrationPrompt
          ? [wrapXmlTextElement("integration_prompt", integrationPrompt)]
          : []),
        "</user_special_instructions>",
      ].join("\n");
    }
  };
  // UTF-16 1890348..1890640
  var SystemReminderSection: any = class {
    [key: string]: any;
    id: any = "system_reminder";
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return isPlanMode(input.codebuddyMeta, input._meta, input.desiredConfig);
    }
    async render(input: any): Promise<any> {
      if (!this.shouldApply(input)) return;
      return loadSystemReminderTemplate();
    }
  };
  // UTF-16 1891569..1891625
  var KNOWN_MARKETPLACES_FILE: any = "known_marketplaces.json";
  // UTF-16 1891626..1891677
  var MARKETPLACE_MANIFEST_FILE: any = "marketplace.json";
  // UTF-16 1891678..1891745
  var PLUGIN_METADATA_DIRS: any = [".codebuddy-plugin", ".claude-plugin"];
  // UTF-16 1891901..1892207
  function getConfigDir(): any {
    const envConfigDir: any =
      process.env.CODEBUDDY_CONFIG_DIR?.trim() ||
      process.env.WORKBUDDY_CONFIG_DIR?.trim();
    if (envConfigDir) return envConfigDir;
    const folder: any =
      process.env.WORKBUDDY_DATA_FOLDER_NAME?.trim() || ".workbuddy";
    return node_path.join(node_os.homedir(), folder);
  }
  // UTF-16 1892508..1893262
  function parseCommandUri(uri: any): any {
    if (!uri.startsWith("command://")) return;
    const body: any = uri.substring(10);
    if (!body) return;
    const firstColon: any = body.indexOf(":");
    if (firstColon < 0) {
      const cmdName: any = body.startsWith("/") ? body.substring(1) : body;
      return cmdName
        ? {
            kind: "builtin",
            cmdName,
          }
        : void 0;
    }
    const secondColon: any = body.indexOf(":", firstColon + 1);
    if (secondColon < 0) return;
    const marketplace: any = body.substring(0, firstColon);
    const plugin: any = body.substring(firstColon + 1, secondColon);
    let cmdName: any = body.substring(secondColon + 1);
    if (cmdName.startsWith("/")) cmdName = cmdName.substring(1);
    if (!marketplace || !plugin || !cmdName) return;
    return {
      kind: "plugin",
      marketplace,
      plugin,
      cmdName,
    };
  }
  // UTF-16 1893369..1893814
  // prettier-ignore
  function resolveMarketplaceRoot(configDir: any, marketplace: any): any {
    const registryPath: any = node_path.join(
      configDir,
      "plugins",
      KNOWN_MARKETPLACES_FILE,
    );
    try {
      if (!node_fs.existsSync(registryPath)) return;
      const raw: any = node_fs.readFileSync(registryPath, "utf-8");
      const installLocation: any =
        (JSON.parse(raw)?.[marketplace])?.installLocation;
      if (typeof installLocation === "string" && installLocation.length > 0)
        return installLocation;
    } catch {}
  }
  // UTF-16 1894000..1894557
  function resolvePluginSourceFromManifest(
    marketplaceRoot: any,
    plugin: any,
  ): any {
    for (const metaDir of PLUGIN_METADATA_DIRS) {
      const manifestPath: any = node_path.join(
        marketplaceRoot,
        metaDir,
        MARKETPLACE_MANIFEST_FILE,
      );
      if (!node_fs.existsSync(manifestPath)) continue;
      try {
        const raw: any = node_fs.readFileSync(manifestPath, "utf-8");
        const data: any = JSON.parse(raw);
        const source: any = (
          Array.isArray(data?.plugins) ? data.plugins : []
        ).find((p: any) => p?.name === plugin)?.source;
        if (typeof source === "string" && source.length > 0) return source;
      } catch {}
    }
  }
  // UTF-16 1895115..1896136
  function collectPluginBaseDirs(
    configDir: any,
    marketplace: any,
    plugin: any,
  ): any {
    const baseDirs: any = [];
    const seen: any = /* @__PURE__ */ new Set();
    const push: any = (p: any) => {
      const normalized: any = node_path.resolve(p);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        baseDirs.push(normalized);
      }
    };
    const marketplaceRoot: any = resolveMarketplaceRoot(configDir, marketplace);
    if (marketplaceRoot) {
      const sourceRel: any = resolvePluginSourceFromManifest(
        marketplaceRoot,
        plugin,
      );
      if (sourceRel) push(node_path.join(marketplaceRoot, sourceRel));
      push(node_path.join(marketplaceRoot, plugin));
      push(node_path.join(marketplaceRoot, "plugins", plugin));
      push(node_path.join(marketplaceRoot, "external_plugins", plugin));
    }
    const legacyMarketplaceRoot: any = node_path.join(
      configDir,
      "plugins",
      "marketplaces",
      marketplace,
    );
    push(node_path.join(legacyMarketplaceRoot, "external_plugins", plugin));
    push(node_path.join(legacyMarketplaceRoot, "plugins", plugin));
    push(node_path.join(legacyMarketplaceRoot, plugin));
    return baseDirs;
  }
  // UTF-16 1896383..1897339
  function findCommandFile(
    configDir: any,
    marketplace: any,
    plugin: any,
    cmdName: any,
  ): any {
    const baseDirs: any = collectPluginBaseDirs(configDir, marketplace, plugin);
    for (const baseDir of baseDirs) {
      const commandsDir: any = node_path.join(baseDir, "commands");
      if (!node_fs.existsSync(commandsDir)) continue;
      const exact: any = node_path.join(commandsDir, `${cmdName}.md`);
      if (node_fs.existsSync(exact)) return exact;
      let mdFiles: any;
      try {
        mdFiles = node_fs
          .readdirSync(commandsDir)
          .filter((f: any) => f.endsWith(".md"));
      } catch {
        continue;
      }
      for (const entry of mdFiles)
        if (entry.replace(/\.md$/i, "").toLowerCase() === cmdName.toLowerCase())
          return node_path.join(commandsDir, entry);
      for (const entry of mdFiles) {
        const filePath: any = node_path.join(commandsDir, entry);
        if (
          (parseMarkdownFrontmatter(filePath).name ||
            entry.replace(/\.md$/i, "")) === cmdName
        )
          return filePath;
      }
      if (mdFiles.length === 1) return node_path.join(commandsDir, mdFiles[0]);
    }
  }
  // UTF-16 1897389..1897966
  function readCommandFile(filePath: any): any {
    try {
      const raw: any = node_fs.readFileSync(filePath, "utf-8");
      const fmMatch: any = raw.match(
        /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/,
      );
      if (fmMatch) {
        const frontmatter: any = fmMatch[1];
        const body: any = fmMatch[2].trim();
        const titleMatch: any = frontmatter.match(
          /^(?:name|title)\s*:\s*(.+)$/m,
        );
        return {
          content: body || raw.trim(),
          title: titleMatch?.[1]?.trim(),
        };
      }
      const titleMatch: any = raw.match(/^#\s+(.+)$/m);
      return {
        content: raw.trim(),
        title: titleMatch?.[1]?.trim(),
      };
    } catch {
      return;
    }
  }
  // UTF-16 1898171..1899227
  function resolveCommandContents(commandLinks: any): any {
    const configDir: any = getConfigDir();
    const resolved: any = [];
    const unresolved: any = [];
    for (const link of commandLinks) {
      const parsed: any = parseCommandUri(link.uri);
      if (!parsed) {
        unresolved.push({
          uri: link.uri,
          name: link.name || link.uri,
          reason: "invalid command URI format",
        });
        continue;
      }
      if (parsed.kind === "builtin") continue;
      const filePath: any = findCommandFile(
        configDir,
        parsed.marketplace,
        parsed.plugin,
        parsed.cmdName,
      );
      if (!filePath) {
        unresolved.push({
          uri: link.uri,
          name: link.name || link.uri,
          reason: `file not found: ${parsed.marketplace}/${parsed.plugin}/commands/${parsed.cmdName}.md`,
        });
        continue;
      }
      const result: any = readCommandFile(filePath);
      if (!result) {
        unresolved.push({
          uri: link.uri,
          name: link.name || link.uri,
          reason: `failed to read: ${filePath}`,
        });
        continue;
      }
      resolved.push({
        uri: link.uri,
        content: result.content,
        title: result.title,
      });
    }
    return {
      resolved,
      unresolved,
    };
  }
  // UTF-16 1899333..1900188
  var UserCommandSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      return getCommandResourceLinks(input.prompt).length > 0;
    }
    async render(input: any): Promise<any> {
      const commandLinks: any = getCommandResourceLinks(input.prompt);
      if (commandLinks.length === 0) return;
      const { resolved, unresolved } = resolveCommandContents(commandLinks);
      if (resolved.length > 0) {
        const commandPrompt: any = resolved
          .map((r: any) => r.content)
          .join("\n\n");
        const existing: any =
          typeof input.codebuddyMeta.commandPrompt === "string"
            ? input.codebuddyMeta.commandPrompt
            : "";
        input.codebuddyMeta.commandPrompt = existing
          ? `${existing}\n\n${commandPrompt}`
          : commandPrompt;
      }
      if (unresolved.length > 0)
        return unresolved
          .map(
            (cmd: any) =>
              `<user_command uri="${escapeXmlAttribute(cmd.uri)}" status="unresolved" reason="${escapeXmlAttribute(cmd.reason)}"/>`,
          )
          .join("\n");
    }
  };
  // UTF-16 1900291..1900985
  var UserInfoSection: any = class {
    [key: string]: any;
    stage: any = "first_turn";
    shouldApply(input: any): any {
      if (input.codebuddyMeta.alreadyInjectedUserContext === true) return false;
      return true;
    }
    async render(input: any): Promise<any> {
      const cwd: any = input.cwd?.trim();
      const rawTheme: any = input.codebuddyMeta?.colorScheme;
      const theme: any =
        rawTheme === "dark" || rawTheme === "light" ? rawTheme : void 0;
      return [
        "<user_info>",
        `OS Version: ${process.platform}`,
        `Shell: ${process.env.SHELL || "bash"}`,
        ...(theme ? [`IDE Theme: ${theme}`] : []),
        ...(cwd ? [`Workspace Folder: ${cwd}`] : []),
        "Note: Prefer using absolute paths over relative paths as tool call args when possible.",
        "</user_info>",
      ].join("\n");
    }
  };
  // UTF-16 1901102..1901219
  function resolveProjectMemoryFolderName(): any {
    return process.env.WORKBUDDY_DATA_FOLDER_NAME?.trim() || ".workbuddy";
  }
  // UTF-16 1901474..1901597
  function isLocalSkillsMemoryDisabled(): any {
    return (
      readAppConfigValue(APP_CONFIG_KEY_DISABLE_LOCAL_SKILLS_MEMORY) === true
    );
  }
  // UTF-16 1901598..1903644
  var WorkingMemoryReminderSection: any = class {
    [key: string]: any;
    stage: any = "every_turn";
    shouldApply(input: any): any {
      if (isLocalSkillsMemoryDisabled()) return false;
      return !!input.cwd?.trim();
    }
    async render(input: any): Promise<any> {
      const cwd: any = input.cwd?.trim();
      if (!cwd) return;
      const folder: any = resolveProjectMemoryFolderName();
      return [
        "<memory_and_skills_reminder>",
        'The system prompt defines "working_memory_files" and "agent_skills". You must strictly follow those rules.',
        "",
        "Memory:",
        `- After substantive work, first check whether today's ${cwd}/${folder}/memory/YYYY-MM-DD.md exists; if not, create it. Then append a brief note about what was done. For long-term facts (user preferences, project conventions), write to ${cwd}/${folder}/memory/MEMORY.md instead.`,
        `- For cross-project user preferences or personal habits (not project-specific), write to ~/${folder}/MEMORY.md instead.`,
        "- Skip memory for greetings, simple lookups, and short Q&A.",
        "",
        "Skills:",
        "- After completing a larger multi-step task (15+ tool calls), fixing a tricky error, or discovering a clearly reusable workflow, consider saving the approach as a skill with SkillManage so it can be reused next time.",
        "- If you notice issues in a skill (typos, garbled text, wrong tool names, outdated info, etc.), update it with SkillManage when practical and useful in the current turn; otherwise mention the follow-up clearly.",
        "- If the work you just did is a repeatable workflow or multi-step process, prefer creating a skill over writing a memory note when it would be genuinely reusable. Skills are actionable; memories are informational.",
        "",
        "General:",
        "- Memory and skills are supplemental — never use them as the primary output. The proper deliverable must be provided in your response or written to the requested file.",
        "- Complete all memory/skill writes as part of your tool-call phase, before your final text reply.",
        "- Do not mention this reminder to the user.",
        "</memory_and_skills_reminder>",
      ].join("\n");
    }
  };
  // UTF-16 1904032..1904313
  var PROJECT_INSTRUCTIONS_HEADER: any =
    "The following are instructions set by the project owner. You MUST follow these instructions at all times during this conversation. They define the context, constraints, and expectations for how you should behave and respond within this project.";
  // UTF-16 1904358..1904523
  var PROJECT_INSTRUCTIONS_REVOKE_NOTICE: any =
    "The previous project instructions have been revoked. From now on, strictly follow the updated project instructions below.";
  // UTF-16 1904605..1904839
  var WORK_SUMMARY_HEADER: any =
    "The following is a summary of work completed before this task was assigned to you. Use it as background context when you need to understand prior progress. Do NOT re-execute any of the work described here.";
  // UTF-16 1904840..1905086
  function renderProjectInstructionsXml(body: any, isUpdate: any): any {
    return `<project-instructions>\n${isUpdate ? `${PROJECT_INSTRUCTIONS_REVOKE_NOTICE}\n\n${PROJECT_INSTRUCTIONS_HEADER}` : PROJECT_INSTRUCTIONS_HEADER}\n\n${body}\n</project-instructions>`;
  }
  // UTF-16 1905087..1905204
  function renderWorkSummaryXml(body: any): any {
    return `<work-summary>\n${WORK_SUMMARY_HEADER}\n\n${body}\n</work-summary>`;
  }
  // UTF-16 1905575..1905845
  function isProjectAccessError(err: any): any {
    if (!err || typeof err !== "object") return false;
    const code: any = err.code;
    const num: any =
      typeof code === "number"
        ? code
        : typeof code === "string" && /^\d+$/.test(code)
          ? Number(code)
          : NaN;
    return num === 17201 || num === 17210;
  }
  // UTF-16 1906179..1906290
  function encodeMsgSnippetForOccupier(snippet: any): any {
    return snippet.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
  // UTF-16 1907729..1909330
  function replaceTeamsChipsWithOccupier(
    blocks: any,
    todoRefs: any,
    msgRefs: any,
  ): any {
    const todoByKey: any = /* @__PURE__ */ new Map();
    for (const t of todoRefs) todoByKey.set(t.todoId, t);
    const msgSeen: any = /* @__PURE__ */ new Map();
    for (const m of msgRefs)
      msgSeen.set(`${m.messageId}\u0000${m.replyId ?? ""}`, {
        author: m.author,
        snippet: m.snippet,
      });
    return blocks.map((block: any) => {
      if (block.type !== "resource_link") return block;
      const meta: any = block._meta ?? {};
      const mentionType: any =
        typeof meta.mentionType === "string" ? meta.mentionType : void 0;
      if (mentionType === "todo") {
        const todoId: any =
          typeof meta.todoId === "string" ? meta.todoId : void 0;
        const hit: any = todoId ? todoByKey.get(todoId) : void 0;
        if (!hit) return block;
        return {
          type: "text",
          text: `@todo:${hit.todoId} ${hit.title}`,
        };
      }
      if (mentionType === "message") {
        const messageId: any =
          typeof meta.messageId === "string" ? meta.messageId : void 0;
        const replyId: any =
          typeof meta.replyId === "string" ? meta.replyId : void 0;
        if (!messageId) return block;
        const hit: any = msgSeen.get(`${messageId}\u0000${replyId ?? ""}`);
        if (!hit) return block;
        const sanitizedAuthor: any =
          typeof hit.author === "string"
            ? hit.author.replace(/[\r\n\t]+/g, " ").trim()
            : "";
        const sanitizedSnippet: any =
          typeof hit.snippet === "string"
            ? hit.snippet.replace(/[\r\n\t]+/g, " ").trim()
            : "";
        if (!sanitizedAuthor) return block;
        return {
          type: "text",
          text: sanitizedSnippet
            ? `@msg:${sanitizedAuthor}"${encodeMsgSnippetForOccupier(sanitizedSnippet)}"`
            : `@msg:${sanitizedAuthor}`,
        };
      }
      return block;
    });
  }
  // UTF-16 1909331..1926792
  var WorkbuddyUserPromptService: any = class WorkbuddyUserPromptService {
    [key: string]: any;
    logger: any;
    connectorService: any;
    systemPromptService: any;
    expertPluginService: any;
    authenticationManager: any;
    productManager: any;
    lastSentConnectorStatus: any = /* @__PURE__ */ new Map();
    /** 项目盘 root resolver（调 N1b，项目本地任务场景） */
    projectNetdriveRootResolver: any;
    resolvedProjectNetdriveRootSessions: any = /* @__PURE__ */ new Set();
    projectNetdriveRootCache: any = /* @__PURE__ */ new Map();
    /** 项目指令 resolver（调 GET /console/as/projects/:id，Teams 本地任务场景） */
    projectInstructionsResolver: any;
    /**
     * 每会话上次注入的项目指令正文（trim 后）。用于 doc §8 的「首次注入 vs 变更重注」判定：
     * 无记录 → 首次（无 revoke）；有记录且不同 → 变更（带 revoke）；相同 → 跳过。
     */
    lastSentProjectInstructions: any = /* @__PURE__ */ new Map();
    /**
     * 每会话缓存的 handoff work-summary 正文（trim 后）。
     *
     * 首轮由上游（desktop UI 提交 handoff 首条 prompt 时）通过 `_meta['codebuddy.ai'].workSummary`
     * 字段传入，daemon 落到本 Map；之后每轮都从缓存回填到 `<team-project-context>`
     * 内的 `<work-summary>` 块（对齐 doc §3.5「首轮下发后每轮都保留作为背景」的常态化语义）。
     *
     * 普通会话（非 Handoff）此块不注入 —— 上游不传 workSummary 元数据即可。
     */
    workSummaryBySession: any = /* @__PURE__ */ new Map();
    sections: any;
    setProjectNetdriveRootResolver(resolver: any): any {
      this.projectNetdriveRootResolver = resolver;
    }
    setProjectInstructionsResolver(resolver: any): any {
      this.projectInstructionsResolver = resolver;
    }
    async initialize(): Promise<any> {
      this.logger.info("[WorkbuddyUserPromptService] Service initialized");
    }
    async composeUserPrompt(request: any): Promise<any> {
      if (!Array.isArray(request.prompt) || request.prompt.length === 0)
        return request.prompt;
      const codebuddyMeta: any = getCodebuddyMeta(request._meta);
      if (codebuddyMeta.isClearSession === true) return request.prompt;
      const alreadyInjectedUserContext: any =
        codebuddyMeta.alreadyInjectedUserContext === true;
      const connectorStatus: any = await this.resolveConnectorStatus(
        request.sessionId,
      );
      const attachedNetDriveItems: any = getAttachedNetDriveItems(
        request.prompt,
      );
      rememberNetDriveAttachments(request.sessionId, attachedNetDriveItems);
      const projectId: any =
        typeof codebuddyMeta.projectId === "string"
          ? codebuddyMeta.projectId
          : "";
      this.logger.info(
        `[WorkbuddyUserPromptService] compose project context ${JSON.stringify({
          sessionId: request.sessionId,
          projectId: projectId || void 0,
          hasProjectId: !!projectId,
          hasPriorUserMessages: request.hasPriorUserMessages === true,
          alreadyInjectedUserContext,
          promptBlockCount: request.prompt.length,
        })}`,
      );
      const netdriveRoot: any = projectId
        ? await this.resolveProjectNetdriveRoot(
            request.sessionId,
            projectId,
            request.hasPriorUserMessages || alreadyInjectedUserContext,
          )
        : void 0;
      const isTeamsProject: any = !!projectId;
      const input: any = {
        ...request,
        codebuddyMeta,
        connectorStatus,
        netdriveRoot,
        isTeamsProject,
        tencentDocsAiEditEnabled: this.resolveTencentDocsAiEditEnabled(),
      };
      const expertSelectionReminder: any = await renderExpertSelectionReminder(
        input,
        this.expertPluginService,
      );
      const filePaths: any = await resolveFileReferencePaths(
        request.prompt,
        request.cwd,
      );
      const userReferencesXml: any = this.renderUserReferencesXml(filePaths);
      const nonContainerParts: any = [];
      const additionalDataParts: any = [];
      const orderedForLegacy: any = [];
      const containerStages: any = /* @__PURE__ */ new Map();
      if (userReferencesXml)
        if (isTeamsProject) additionalDataParts.push(userReferencesXml);
        else
          orderedForLegacy.push({
            text: userReferencesXml,
            isAdditionalData: false,
          });
      for (const section of this.getSections()) {
        if (
          section.stage === "first_turn" &&
          (input.hasPriorUserMessages || alreadyInjectedUserContext)
        )
          continue;
        if (!section.shouldApply(input)) continue;
        const xml: any = await section.render(input);
        if (!xml?.trim()) continue;
        const trimmedXml: any = xml.trim();
        const isAdditionalData: any = section.container === "additional_data";
        if (isAdditionalData) {
          const firstStage: any = containerStages.get("additional_data");
          if (!firstStage)
            containerStages.set("additional_data", section.stage);
          else if (firstStage !== section.stage)
            this.logger.warn(
              `[WorkbuddyUserPromptService] additional_data container has mixed stages: ${firstStage}, ${section.stage}`,
            );
          additionalDataParts.push(trimmedXml);
        } else nonContainerParts.push(trimmedXml);
        orderedForLegacy.push({
          text: trimmedXml,
          isAdditionalData,
        });
      }
      if (isTeamsProject) {
        const userContextParts: any = [...nonContainerParts];
        const connectorLines: any = renderConnectorStatusBlock(connectorStatus);
        if (connectorLines.length > 0)
          userContextParts.push(connectorLines.join("\n"));
        const todoReferences: any = getAttachedTodoReferences(request.prompt);
        const messageReferences: any = getAttachedMessageReferences(
          request.prompt,
        );
        const todoWorkSummaryParts: any = todoReferences
          .map((t: any) => (t.workSummary ?? "").trim())
          .filter((part: any) => part.length > 0);
        const isFirstTurn: any = !(
          request.hasPriorUserMessages || alreadyInjectedUserContext
        );
        const teamContextParts: any = [];
        if (isFirstTurn) {
          teamContextParts.push(
            TEAM_PROJECT_CONTEXT_IDENTITY,
            PROJECT_TOOL_ROUTING_XML,
          );
          const tdriveRootXml: any = netdriveRoot?.fileId
            ? renderNetdriveRoot(netdriveRoot).join("\n")
            : void 0;
          teamContextParts.push(formatProjectFileRulesXml(tdriveRootXml));
        }
        const projectInstructionsXml: any =
          await this.resolveProjectInstructions(request.sessionId, projectId);
        if (projectInstructionsXml)
          teamContextParts.push(projectInstructionsXml);
        const workSummaryXml: any = this.resolveWorkSummary(
          request.sessionId,
          codebuddyMeta,
          todoWorkSummaryParts,
        );
        if (workSummaryXml) teamContextParts.push(workSummaryXml);
        const teamContextXml: any =
          teamContextParts.length > 0
            ? wrapTeamProjectContext(teamContextParts)
            : "";
        if (teamContextXml) userContextParts.push(teamContextXml);
        const additionalDataOut: any = [...additionalDataParts];
        const netDriveItems: any = getAttachedNetDriveItems(request.prompt);
        if (netDriveItems.length > 0)
          additionalDataOut.push(
            renderNetDriveAttachments(netDriveItems).join("\n"),
          );
        const todoRefLines: any = renderTodoReferenceXml(todoReferences);
        if (todoRefLines.length > 0)
          additionalDataOut.push(todoRefLines.join("\n"));
        const msgRefLines: any = renderMessageReferenceXml(messageReferences);
        if (msgRefLines.length > 0)
          additionalDataOut.push(msgRefLines.join("\n"));
        const hiddenBlocks: any = [];
        if (expertSelectionReminder)
          hiddenBlocks.push({
            type: "text",
            text: expertSelectionReminder,
            _meta: { [EXPERT_SELECTION_BLOCK_META_KEY]: true },
          });
        const userContextXml: any = userContextParts.join("\n");
        if (userContextXml.trim())
          hiddenBlocks.push({
            type: "text",
            text: wrapHiddenContextXml(userContextXml, USER_CONTEXT_ROLE),
          });
        const additionalDataXml: any = additionalDataOut.join("\n");
        if (additionalDataXml.trim())
          hiddenBlocks.push({
            type: "text",
            text: wrapHiddenContextXml(additionalDataXml, ADDITIONAL_DATA_ROLE),
          });
        const transformedPrompt: any = replaceTeamsChipsWithOccupier(
          structuredClone(request.prompt),
          todoReferences,
          messageReferences,
        );
        if (hiddenBlocks.length === 0) return transformedPrompt;
        this.logger.info(
          `[WorkbuddyUserPromptService] Injected ${hiddenBlocks.length} Teams hidden context block(s) for session ${request.sessionId}`,
        );
        return [...hiddenBlocks, ...transformedPrompt];
      }
      const xmlParts: any = [];
      let additionalDataInsertIndex: any = -1;
      for (const part of orderedForLegacy)
        if (part.isAdditionalData) {
          if (additionalDataInsertIndex < 0) {
            additionalDataInsertIndex = xmlParts.length;
            xmlParts.push("");
          }
        } else xmlParts.push(part.text);
      if (additionalDataInsertIndex >= 0)
        xmlParts[additionalDataInsertIndex] = [
          "<additional_data>",
          ...additionalDataParts,
          "</additional_data>",
        ].join("\n");
      if (xmlParts.length === 0 && !expertSelectionReminder)
        return request.prompt;
      const hiddenBlocks: any = [];
      if (expertSelectionReminder)
        hiddenBlocks.push({
          type: "text",
          text: expertSelectionReminder,
          _meta: { [EXPERT_SELECTION_BLOCK_META_KEY]: true },
        });
      if (xmlParts.length > 0)
        hiddenBlocks.push({
          type: "text",
          text: wrapHiddenContextXml(xmlParts.join("\n")),
        });
      this.logger.info(
        `[WorkbuddyUserPromptService] Injected ${hiddenBlocks.length} hidden user context block(s) for session ${request.sessionId}`,
      );
      return [...hiddenBlocks, ...structuredClone(request.prompt)];
    }
    renderUserReferencesXml(filePaths: any): any {
      if (filePaths.length === 0) return;
      return [
        "<user_references>",
        "Note: These references are the files the user explicitly referenced. Only paths are provided.",
        "Note: Use read tool to fetch contents when you need them.",
        ...filePaths.map((p: any) => JSON.stringify(p)),
        "</user_references>",
      ].join("\n");
    }
    cleanup(): any {
      this.lastSentConnectorStatus.clear();
      this.resolvedProjectNetdriveRootSessions.clear();
      this.projectNetdriveRootCache.clear();
      this.lastSentProjectInstructions.clear();
      this.workSummaryBySession.clear();
      clearNetDriveAttachments();
    }
    /**
     * 精准清理与「当前账号 projectId」强绑定的 in-memory 缓存（#73615 漏修补齐）。
     *
     * 触发场景：账号 / 企业身份变更（authService.onStateChanged 差分命中），
     * 或 resolver 对后端接口打出 17201/17210（project not found / not a project member）。
     *
     * 只清 3 个 project 维度的 Map，**不动** `workSummaryBySession` 与 `lastSentConnectorStatus`：
     * 前者是 handoff 会话上下文（账号无关），后者是 connector 状态指纹（由 connector-service
     * 自身的 bindAccountChangeListener 负责刷新）。
     *
     * 与 session-manager 三态判定（#73615 + #74679）互补：session-manager 拦「入口」
     * 复用旧 projectId，本方法清「出口」缓存避免旧 projectId 继续打后端。
     */
    clearProjectCaches(): any {
      this.resolvedProjectNetdriveRootSessions.clear();
      this.projectNetdriveRootCache.clear();
      this.lastSentProjectInstructions.clear();
    }
    getSections(): any {
      if (!this.sections)
        this.sections = [
          new UserInfoSection(),
          new IdentityContextSection(this.systemPromptService),
          new RulesSection(),
          new ProjectContextSection(),
          new AdditionalDataSection(),
          new TencentDocsAdditionalSection(() =>
            this.resolveTencentDocsAiEditEnabled(),
          ),
          new UserCommandSection(),
          new SpecialInstructionsSection(),
          new SystemReminderSection(),
          new ModeTransitionReminderSection(),
          new CurrentExpertReminderSection(),
          new WorkingMemoryReminderSection(),
          new AutomationSystemReminderSection(),
          new AttachedSkillsSection(),
          new ArdotFileDirectiveSection(),
          new ArdotDesignStyleSection(),
          new ArdotImageGenSection(),
        ];
      return this.sections;
    }
    /**
     * Teams 本地任务：解析 Handoff work-summary（doc §3.5 / §11）。
     *
     * 写入优先级（新→旧）：
     *   1. 本轮 @todo chip 的 `_meta.workSummary`（Handoff/dispatch 场景由前端在 chip 上写入）；
     *   2. `_meta['codebuddy.ai'].workSummary`（desktop 首条 handoff prompt 时的旧通道，仍兼容）；
     *
     * 命中任一就落缓存并覆盖旧值；之后每轮都回填缓存（常态化保留，对齐 §3.5）。
     * 普通会话（非 Handoff）此块不注入 —— 上游不传即可，缓存也不建。
     *
     * 多个 todo 同时带 workSummary 时按插入顺序合并为多段（用两个空行分隔），
     * 保持每段的原文可读性。
     */
    resolveWorkSummary(
      sessionId: any,
      codebuddyMeta: any,
      todoWorkSummaryParts: any = [],
    ): any {
      const fromTodos: any = todoWorkSummaryParts
        .map((part: any) => part.trim())
        .filter((part: any) => part.length > 0)
        .join("\n\n");
      const fromMeta: any =
        typeof codebuddyMeta.workSummary === "string"
          ? codebuddyMeta.workSummary.trim()
          : "";
      const incoming: any = fromTodos || fromMeta;
      if (incoming) this.workSummaryBySession.set(sessionId, incoming);
      const cached: any = this.workSummaryBySession.get(sessionId);
      if (!cached) return;
      return renderWorkSummaryXml(cached);
    }
    /**
     * Teams 本地任务：解析项目指令并按会话做「首次/变更/未变」判定（doc §3/§8）。
     *
     * - 无 resolver / 无指令 → 返回 undefined（不注入）。
     * - 首次注入（本会话无记录）→ 返回不带 revoke 的 `<project-instructions>`。
     * - 相较上次有变更 → 返回带 revoke 覆盖提示的 `<project-instructions>`。
     * - 与上次相同 → 返回 undefined（不重复注入；模型靠上下文自然记住）。
     *
     * 说明：instructions 可能被 owner 随时改，故每轮都现取一次（对齐 connector-status 每轮 diff）。
     * resolver 内部/此处均 try/catch 静默降级，失败不阻断发送。
     */
    async resolveProjectInstructions(
      sessionId: any,
      projectId: any,
    ): Promise<any> {
      if (!this.projectInstructionsResolver || !projectId) {
        this.logger.warn(
          `[WorkbuddyUserPromptService] project instructions skipped before resolve ${JSON.stringify(
            {
              sessionId,
              projectId: projectId || void 0,
              resolverRegistered: !!this.projectInstructionsResolver,
            },
          )}`,
        );
        return;
      }
      try {
        this.logger.info(
          `[WorkbuddyUserPromptService] resolving project instructions ${JSON.stringify(
            {
              sessionId,
              projectId,
            },
          )}`,
        );
        const resolved: any = await this.projectInstructionsResolver(projectId);
        const body: any = (resolved?.instructions ?? "").trim();
        const version: any = resolved?.version || void 0;
        const lastSent: any = this.lastSentProjectInstructions.get(sessionId);
        this.logger.debug(
          `[WorkbuddyUserPromptService] project instructions resolved ${JSON.stringify(
            {
              sessionId,
              projectId,
              version,
              bodyLength: body.length,
              hasPreviousSnapshot: lastSent !== void 0,
              previousBodyLength: lastSent?.length ?? 0,
            },
          )}`,
        );
        if (!body) {
          this.logger.warn(
            `[WorkbuddyUserPromptService] project instructions empty ${JSON.stringify(
              {
                sessionId,
                projectId,
                hasPreviousSnapshot: lastSent !== void 0,
              },
            )}`,
          );
          return;
        }
        if (lastSent === body) {
          this.logger.debug(
            `[WorkbuddyUserPromptService] project instructions unchanged ${JSON.stringify(
              {
                sessionId,
                projectId,
                version,
              },
            )}`,
          );
          return;
        }
        const isUpdate: any = lastSent !== void 0 && lastSent !== body;
        this.lastSentProjectInstructions.set(sessionId, body);
        this.logger.info(
          `[WorkbuddyUserPromptService] project instructions will inject ${JSON.stringify(
            {
              sessionId,
              projectId,
              version,
              isUpdate,
              bodyLength: body.length,
            },
          )}`,
        );
        return renderProjectInstructionsXml(body, isUpdate);
      } catch (err: any) {
        if (isProjectAccessError(err)) {
          this.logger.warn(
            `[WorkbuddyUserPromptService] Project access denied while resolving instructions (projectId=${projectId}, sessionId=${sessionId}); clearing project caches:`,
            err,
          );
          this.clearProjectCaches();
          return;
        }
        this.logger.info(
          "[WorkbuddyUserPromptService] Failed to resolve project instructions:",
          err,
        );
        return;
      }
    }
    async resolveConnectorStatus(sessionId: any): Promise<any> {
      if (!this.connectorService) return;
      try {
        const [configs, states] = await Promise.all([
          this.connectorService.getConfigs(),
          this.connectorService.getStates(),
        ]);
        const entries: any = [];
        for (const config of configs) {
          const status: any =
            states[config.id]?.status === "connected"
              ? "connected"
              : "disconnected";
          entries.push({
            configId: config.id,
            displayName: config.name,
            status,
          });
        }
        if (this.isAgentMailEligible())
          entries.push({
            configId: "agent-mail",
            displayName: "Agent Mail | 智能体邮箱",
            status: "connected",
          });
        entries.sort((a: any, b: any) => a.configId.localeCompare(b.configId));
        if (entries.length === 0) return;
        const serialized: any = entries
          .map((e: any) => `${e.configId}:${e.status}`)
          .join(",");
        if (this.lastSentConnectorStatus.get(sessionId) === serialized) return;
        this.lastSentConnectorStatus.set(sessionId, serialized);
        return entries;
      } catch (err: any) {
        this.logger.info(
          "[WorkbuddyUserPromptService] Failed to resolve connector status:",
          err,
        );
        return;
      }
    }
    /**
     * 内置 Agent Mail MCP 是否已通过门控。
     *
     * 判定口径与 `ConnectorService.buildAgentMailMcpConfig` / renderer `useAgentMailFeature` /
     * main-bootstrap `evaluateAgentMailToolState` 完全一致：
     *   `productFeatures.AgentMail === true` 且非企业账号。
     *
     * 用途：在 `<connector-status>` 中虚拟注入 agent-mail 条目——门控通过时展示 `connected`，
     * 与实际注入的 MCP 工具保持一致，避免模型误以为有 agent-mail 工具但实际已被门控移除导致调用失败。
     */
    // prettier-ignore
    isAgentMailEligible(): any {
      if (!((this.productManager?.getCurrentConfiguration?.()?.productFeatures)?.AgentMail === true)) return false;
      return !this.authenticationManager?.currentSessionSubject.getValue()
        ?.account?.enterpriseId;
    }
    /** 腾讯文档「AI 编辑」灰度是否命中（每轮现读）；判定细节见 {@link resolveTencentDocsAiEditConfigEnabled}。 */
    resolveTencentDocsAiEditEnabled(): any {
      const features: any =
        this.productManager?.getCurrentConfiguration?.()?.productFeatures;
      const account: any =
        this.authenticationManager?.currentSessionSubject.getValue()?.account;
      return resolveTencentDocsAiEditConfigEnabled(features, account);
    }
    /**
     * 项目本地任务注入项目盘 root（Teams 上下文策略 §3.3 / §4.3）。
     *
     * 调 N1b `/console/as/netdrive/projects/{projectId}/access-token` 获取
     * 项目网盘隔离目录 fileId，注入 `<tdrive-root id="..." dir_name="..." scope="project" />`
     * 到 `<project-file-rules>` 内（策略要求"项目会话每一轮都会输出一次"）。
     *
     * 缓存策略：
     * - 首轮（`skipCall === false` 且缓存未建）→ 调 resolver 一次，成功/失败结果都落缓存
     *   （成功：存 `NetdriveRootInfo`；失败或空：存 `null` 哨兵）
     * - 续轮（`skipCall === true`）或首轮已解析过 → **直接返回缓存值**，不再触发 N1b
     * - `null` 哨兵表示"已尝试但失败/无 root"，续轮同样不重复调用
     *
     * 关键：`skipCall` 只挡"是否发起 resolver 请求"，不能挡"回填缓存值"—— 否则续轮的
     * `<project-file-rules>` 就会丢 `<tdrive-root />`，违反策略 §3.3 每轮注入语义。
     */
    async resolveProjectNetdriveRoot(
      sessionId: any,
      projectId: any,
      skipCall: any,
    ): Promise<any> {
      if (!this.projectNetdriveRootResolver) return;
      if (this.resolvedProjectNetdriveRootSessions.has(sessionId))
        return this.projectNetdriveRootCache.get(sessionId) ?? void 0;
      if (skipCall) return;
      this.resolvedProjectNetdriveRootSessions.add(sessionId);
      try {
        const root: any = await this.projectNetdriveRootResolver(projectId);
        if (!root?.fileId) {
          this.projectNetdriveRootCache.set(sessionId, null);
          return;
        }
        this.projectNetdriveRootCache.set(sessionId, root);
        return root;
      } catch (err: any) {
        if (isProjectAccessError(err)) {
          this.logger.warn(
            `[WorkbuddyUserPromptService] Project access denied while resolving netdrive root (projectId=${projectId}, sessionId=${sessionId}); clearing project caches:`,
            err,
          );
          this.clearProjectCaches();
          return;
        }
        this.logger.info(
          "[WorkbuddyUserPromptService] Failed to resolve project netdrive root:",
          err,
        );
        this.projectNetdriveRootCache.set(sessionId, null);
        return;
      }
    }
  };
  return {
    TencentDocsAdditionalSection,
    AdditionalDataSection,
    ArdotDesignStyleSection,
    ArdotFileDirectiveSection,
    ArdotImageGenSection,
    AttachedSkillsSection,
    AutomationSystemReminderSection,
    CurrentExpertReminderSection,
    IdentityContextSection,
    ModeTransitionReminderSection,
    ProjectContextSection,
    RulesSection,
    SpecialInstructionsSection,
    SystemReminderSection,
    UserCommandSection,
    UserInfoSection,
    WorkingMemoryReminderSection,
    WorkbuddyUserPromptService,
    wrapTeamProjectContext,
    formatProjectFileRulesXml,
    escapeXmlAttribute$1,
    wrapXmlTextCdata,
    wrapXmlTextElement,
    wrapHiddenContextXml,
    stripSystemReminderXml,
    wrapUserQueryXml,
    addUniquePath,
    isWindowsAbsoluteLocalPath,
    normalizeMentionedLocalPath,
    collectPromptStringCandidates,
    getTextMentionedLocalOfficeFilePaths,
    getTextMentionedLocalOfficeFileNames,
    mergeUniquePaths,
    readString$4,
    readPromptSelectionPayload,
    parseTencentDocsSelectionBlock,
    getAllTencentDocsSelectionsFromPrompt,
    isTencentOnlineFilePath,
    extractTencentOnlineFileId,
    computeLocalPreviewGlobalPadId,
    isLocalPreviewGlobalPadId,
    hasTencentDocsAiServiceExtension,
    isTencentDocsAiServiceFilePath,
    resolveToolUsableLocalFileId,
    deriveAccountContext,
    resolveTencentDocsAiEditConfigEnabled,
    parseMarkdownFrontmatter,
    extractFrontmatterField,
    stripYamlQuotes,
    readBlockScalar,
    normalizeExtension,
    isImageExtension,
    isTextDocumentExtension,
    isCodeExtension,
    isOfficeDocumentExtension,
    sizeExceeded,
    formatMb,
    classifyNetDriveItem,
    getCodebuddyMeta,
    getResourceLinks,
    getFileResourceLinks,
    getCommandResourceLinks,
    getImaResourceLinks,
    getLexiangResourceLinks,
    getAgentMailResourceLinks,
    getNetDriveResourceLinks,
    getWechatChatHistoryResourceLinks,
    getAttachedNetDriveItems,
    parseNetDriveUri,
    getAttachedImaFiles,
    getAttachedLexiangFiles,
    getAttachedAgentMails,
    parseLexiangUri,
    getAttachedTodoReferences,
    parseTodoIdFromUri,
    getAttachedMessageReferences,
    getAttachedSkills,
    getFileAndFolderPaths,
    resolveFileReferencePaths,
    resolveResourceLinkLocalPath,
    hasUriScheme,
    resolveLocalPath,
    getCommandPrompt,
    getIntegrationPrompt,
    getAutomationSystemReminder,
    getArdotFileAction,
    getDesignStyleType,
    getDesignStyleUrl,
    getDesignStyleId,
    getImageMode,
    isPlanMode,
    toLocalPath,
    decodeURIComponentSafe,
    readString$2,
    readNumber,
    readBoolean,
    getExtension,
    getAttachedWechatChatHistoryItems,
    readString$1,
    getTencentDocResourceLinks,
    getAttachedTencentDocs,
    appendFileIdToUrl,
    readString,
    readRawSelectionString,
    buildRemoteDocFromSelection,
    appendUniqueTencentDoc,
    getPromptBlockTypes,
    normalizeFileId,
    rememberNetDriveAttachments,
    clearNetDriveAttachments,
    readNonEmptyString$1,
    readExpertSelectionIdentity,
    isSameExpertSelection,
    escapeXmlText$2,
    readExpertDisplayName,
    renderCancelledSelection,
    renderExpertSelectionReminder,
    escapeXmlAttribute,
    escapeXmlText$1,
    renderImaUsage,
    renderWorkBuddyFileHandling,
    renderLexiangUsage,
    renderAgentMailUsage,
    renderNetdriveRoot,
    renderConnectorStatusBlock,
    renderWechatChatHistory,
    renderTodoReferenceXml,
    renderMessageReferenceXml,
    renderNetDriveAttachments,
    extractFilename,
    escapeAttr,
    isCraftMode,
    renderInstruction,
    readNonEmptyString,
    escapeXmlText,
    readExpertTypeLabel,
    loadSystemReminderTemplate,
    loadModeTransitionReminderTemplate,
    requirePromptTemplate,
    readTransitionMode,
    readProjectGuidance,
    readProjectLayout,
    summarizeSubtree,
    getConfigDir,
    parseCommandUri,
    resolveMarketplaceRoot,
    resolvePluginSourceFromManifest,
    collectPluginBaseDirs,
    findCommandFile,
    readCommandFile,
    resolveCommandContents,
    resolveProjectMemoryFolderName,
    isLocalSkillsMemoryDisabled,
    renderProjectInstructionsXml,
    renderWorkSummaryXml,
    isProjectAccessError,
    encodeMsgSnippetForOccupier,
    replaceTeamsChipsWithOccupier,
    SYSTEM_REMINDER_BLOCK_RE,
    USER_CONTEXT_ROLE,
    ADDITIONAL_DATA_ROLE,
    TEAM_PROJECT_CONTEXT_TAG,
    TEAM_PROJECT_CONTEXT_IDENTITY,
    PROJECT_TOOL_ROUTING_XML,
    PROJECT_FILE_RULES_HEADER,
    PROJECT_FILE_RULES_MANDATORY_WORKFLOW,
    FILE_URI_PATTERN,
    LOCAL_PATH_DRIVE_OR_POSIX_PREFIX,
    DOUBLE_QUOTED_LOCAL_PATH_PATTERN,
    SINGLE_QUOTED_LOCAL_PATH_PATTERN,
    UNQUOTED_LOCAL_PATH_PATTERN,
    PLAIN_LOCAL_OFFICE_FILENAME_PATTERN,
    MAX_PROMPT_SCAN_DEPTH,
    MAX_PROMPT_STRING_LENGTH,
    SKIPPED_PROMPT_STRING_KEYS,
    TENCENT_ONLINE_FILE_PATH_PREFIX,
    DEFAULT_ENTERPRISE_VARIANT_KEY,
    VPC_ENTERPRISE_VARIANT_KEY,
    IMAGE_EXTENSIONS,
    TEXT_DOCUMENT_EXTENSIONS,
    CODE_EXTENSIONS,
    OFFICE_DOCUMENT_EXTENSIONS,
    IMAGE_MIME_TYPES,
    TEXT_MIME_TYPES,
    OFFICE_MIME_TYPES,
    NETDRIVE_FILE_SIZE_LIMITS,
    TODO_TAG_KEY_WHITELIST,
    LOCAL_FILE_MENTION_TYPES,
    attachmentsBySession,
    MAX_EXPERT_PROMPT_CHARS,
    EXPERT_SELECTION_BLOCK_META_KEY,
    BUILTIN_DEFAULT_CONNECTOR,
    IMA_USAGE_INSTRUCTIONS,
    LEXIANG_USAGE_INSTRUCTIONS,
    WORKBUDDY_FILE_HANDLING_INSTRUCTIONS,
    AGENT_MAIL_USAGE_INSTRUCTIONS,
    NETDRIVE_USAGE_HEADER,
    WECHAT_CHAT_HISTORY_INSTRUCTIONS,
    TODO_REFERENCE_HEADER,
    MESSAGE_REFERENCE_HEADER,
    INSTRUCTION,
    TEMPLATE_NAMES,
    GUIDANCE_FILES,
    MAX_GUIDANCE_CHARS,
    MAX_LAYOUT_ENTRIES,
    MAX_SUBTREE_DEPTH,
    MAX_TOP_EXTENSIONS,
    KNOWN_MARKETPLACES_FILE,
    MARKETPLACE_MANIFEST_FILE,
    PLUGIN_METADATA_DIRS,
    PROJECT_INSTRUCTIONS_HEADER,
    PROJECT_INSTRUCTIONS_REVOKE_NOTICE,
    WORK_SUMMARY_HEADER,
  };
}

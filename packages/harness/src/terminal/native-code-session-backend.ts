// @ts-nocheck
import * as node_fs from 'node:fs';
import * as node_path from 'node:path';
import * as nodeOs from 'node:os';
import * as node_crypto from 'node:crypto';
import * as node_net from 'node:net';
import * as node_http from 'node:http';
import * as node_https from 'node:https';
import {createNativeSidecarManager} from './native-sidecar-manager.js';
import {createNativeCliPrewarmPool} from './native-cli-prewarm-pool.js';
import {createNativeSidecarEnvironment} from './native-sidecar-environment.js';
import {createNativeSidecarClientInfo} from './native-sidecar-client-info.js';
import {createNativeSidecarCliProductEnvironment} from './native-sidecar-cli-product-env.js';
import {createNativeSidecarProxyEnvironment} from './native-sidecar-proxy-env.js';
import {createNativeSessionReplayTransport} from '../sessions/native-session-replay-transport.js';
export const CODE_SESSION_BACKEND_SOURCE=[{"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78","regions":[{"from":337130,"to":337179},{"from":337180,"to":337239},{"from":337404,"to":337467},{"from":345601,"to":345690},{"from":349551,"to":349697},{"from":350394,"to":350487},{"from":350488,"to":350567},{"from":350655,"to":350715},{"from":350716,"to":350754},{"from":350755,"to":350787},{"from":350788,"to":350822},{"from":350823,"to":350857},{"from":350858,"to":350890},{"from":350891,"to":350921},{"from":350922,"to":350960},{"from":350961,"to":351001},{"from":351002,"to":351044},{"from":351045,"to":351083},{"from":351084,"to":351136},{"from":351137,"to":351179},{"from":351180,"to":351216},{"from":351217,"to":351255},{"from":351256,"to":351288},{"from":351289,"to":351323},{"from":351324,"to":351367},{"from":351368,"to":351408},{"from":351409,"to":351706},{"from":351707,"to":357884},{"from":357885,"to":358881},{"from":358882,"to":358988},{"from":358989,"to":359096},{"from":359210,"to":359326},{"from":359457,"to":359676},{"from":359677,"to":359863},{"from":359864,"to":360114},{"from":360115,"to":360194},{"from":360272,"to":360567},{"from":360650,"to":360976},{"from":361043,"to":361202},{"from":361203,"to":361320},{"from":361321,"to":361619},{"from":361761,"to":362033},{"from":362034,"to":362369},{"from":362737,"to":363434},{"from":363435,"to":365155},{"from":365156,"to":365304},{"from":365305,"to":365502},{"from":365503,"to":365706},{"from":365707,"to":365837},{"from":365838,"to":365955},{"from":365956,"to":366115},{"from":366116,"to":366302},{"from":366303,"to":366593},{"from":366594,"to":367004},{"from":367005,"to":367138},{"from":367139,"to":367371},{"from":952664,"to":952723},{"from":1760143,"to":1760336}],"names":["CONNECTOR_PROXY_MCP_NAME","WORKBUDDY_SESSION_ID_HEADER","WORKBUDDY_WELCOME_MODE_HEADER","SYSTEM_REMINDER_BLOCK_RE","escapeXmlAttribute$1","stripSystemReminderXml","wrapUserQueryXml","ACP_RESOURCE_LINK_PROVIDER_DATA_KEY","COMMAND_URI_PREFIX","FILE_URI_PREFIX","SCENE_URI_PREFIX","SKILL_URI_PREFIX","TDOC_URI_PREFIX","IMA_URI_PREFIX","LEXIANG_URI_PREFIX","NETDRIVE_URI_PREFIX","SELECTION_URI_PREFIX","COMMENT_URI_PREFIX","TDOC_SELECTION_URI_PREFIX","AGENTMAIL_URI_PREFIX","EXPERT_URI_PREFIX","ARTICLE_URI_PREFIX","HTTP_URI_PREFIX","HTTPS_URI_PREFIX","BARE_BADGE_CHAR_RE","WORDISH_CHAR_RE","getAcpResourceLinkDisplayName","encodeAcpResourceLinkToInputText","isInlineEncodableResourceLink","isRecord","readString$3","readPresentSelectionText","formatDocumentSelectionContextText","readFormattedSelectionDisplayText","readTDocSelectionTimestampRef","isTDocSelectionTimestampRef","readTDocSelectionTimestampRefFromHint","readTDocSelectionDisplayNameFromHint","formatTDocSelectionBadge","formatTDocSelectionRefBadge","collectAgentMailProviderHint","collectCommentProviderHint","collectTencentDocsProviderHint","collectLexiangProviderHint","extractRuntimePromptText","createInlineImageBadgeToken","getInlinePromptResourceText","getInlineImageLabel","decodeFileUriPath","decodeURIComponentSafe$1","encodeInlineBadgeValue","isBareInlineBadgeValue","appendInlineTextPiece","needsInlineSeparator","getLastPathSegment","toInlineEncodableResourceUri","WORKBUDDY_PROJECT_ID_HEADER","resolveResponseLocaleIsZh"]},{"file":"initialize.js","sha256":"528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19","regions":[{"from":1976603,"to":1976705},{"from":1976706,"to":1977052},{"from":1977053,"to":1977161},{"from":1977275,"to":1977336},{"from":3259008,"to":3259071},{"from":3259072,"to":3259100},{"from":3259101,"to":3259122},{"from":3259123,"to":3259150},{"from":3259520,"to":3259711},{"from":3259712,"to":3259825},{"from":3259826,"to":3259945},{"from":3259946,"to":3260567},{"from":3260680,"to":3261116},{"from":3261117,"to":3261296},{"from":3261297,"to":3261775},{"from":3261858,"to":3262628},{"from":3262878,"to":3263378},{"from":3263806,"to":3264536},{"from":3264537,"to":3265311},{"from":4543513,"to":4543694},{"from":4543695,"to":4544168},{"from":4544169,"to":4544591},{"from":4544592,"to":4544739},{"from":4544740,"to":4545360},{"from":5386264,"to":5387469},{"from":5387470,"to":5387733},{"from":5387734,"to":5388310},{"from":5388311,"to":5388723},{"from":5388724,"to":5410355},{"from":5410356,"to":5411426},{"from":5411427,"to":5411838},{"from":5411839,"to":5411978},{"from":5411979,"to":5412586},{"from":5412587,"to":5413063},{"from":5413143,"to":5413203},{"from":5413204,"to":5413265},{"from":5413266,"to":5415767},{"from":5415853,"to":5416024},{"from":5416025,"to":5416142},{"from":5416143,"to":5416285},{"from":5416286,"to":5416524},{"from":5416525,"to":5416748},{"from":5416749,"to":5418332},{"from":5418421,"to":5418493},{"from":5418534,"to":5418588},{"from":5418589,"to":5418895},{"from":5418896,"to":5419260},{"from":5419261,"to":5419414},{"from":5419415,"to":5419785},{"from":5420020,"to":5421687},{"from":5421688,"to":5422864},{"from":5422865,"to":5423171},{"from":5423172,"to":5423293},{"from":5423294,"to":5423384},{"from":5423385,"to":5423473},{"from":5423474,"to":5425196},{"from":5425197,"to":5425605},{"from":5425992,"to":5426506},{"from":5426603,"to":5426628},{"from":5426629,"to":5426653},{"from":5426654,"to":5426699},{"from":5426700,"to":5426765},{"from":5426766,"to":5426816},{"from":5426817,"to":5426861},{"from":5426862,"to":5426885},{"from":5426886,"to":5426918},{"from":5426919,"to":5426949},{"from":5426950,"to":5427723},{"from":5427724,"to":5427901},{"from":5427902,"to":5431082},{"from":5431083,"to":5431226},{"from":5431227,"to":5432004},{"from":5432005,"to":5432809},{"from":5432810,"to":5433060},{"from":5433061,"to":5433175},{"from":5433176,"to":5433678},{"from":5433679,"to":5433761},{"from":5433762,"to":5433861},{"from":5433862,"to":5433992},{"from":5433993,"to":5434191},{"from":5434192,"to":5434350},{"from":5434351,"to":5434586},{"from":5434587,"to":5434683},{"from":5434684,"to":5435006},{"from":5435371,"to":5435447},{"from":5435448,"to":5435483},{"from":5435484,"to":5435524},{"from":5435525,"to":5435596},{"from":5435597,"to":5435671},{"from":5435672,"to":5435724},{"from":5435725,"to":5435777},{"from":5435778,"to":5436005},{"from":5436203,"to":5436318},{"from":5436520,"to":5436658},{"from":5436659,"to":5436684},{"from":5436685,"to":5436932},{"from":5436933,"to":5436973},{"from":5436974,"to":5437073},{"from":5437074,"to":5437138},{"from":5437139,"to":5437620},{"from":5437621,"to":5437700},{"from":5437701,"to":5437962},{"from":5437963,"to":5438090},{"from":5438338,"to":5438581},{"from":5438582,"to":5439228},{"from":5439422,"to":5439766},{"from":5439954,"to":5440164},{"from":5440337,"to":5440529},{"from":5440530,"to":5444868},{"from":5444869,"to":5493683},{"from":5495667,"to":5495948},{"from":5496840,"to":5497408},{"from":5497476,"to":5498274},{"from":5498275,"to":5498885},{"from":5498886,"to":5498983},{"from":5498984,"to":5499088},{"from":5499089,"to":5499449},{"from":5499450,"to":5500011},{"from":5500012,"to":5500201},{"from":5500202,"to":5500475},{"from":5500476,"to":5500602},{"from":5500603,"to":5501436},{"from":5501437,"to":5503823},{"from":5503824,"to":5504877},{"from":5504878,"to":5505081},{"from":5505082,"to":5505278},{"from":5505721,"to":5505781},{"from":5505782,"to":5507888},{"from":5507889,"to":5508274},{"from":5508275,"to":5508510},{"from":5508511,"to":5508691},{"from":5508692,"to":5509319},{"from":5509320,"to":5509384},{"from":5509385,"to":5509808},{"from":5509809,"to":5509956},{"from":5509957,"to":5510242},{"from":5510243,"to":5510748},{"from":5510749,"to":5510898},{"from":5510899,"to":5511177},{"from":5511178,"to":5511771},{"from":5511772,"to":5512395},{"from":3259223,"to":3259338},{"from":3259339,"to":3259429}],"names":["isRecord$10","stableStringify","sha256Hex","commandHash","DEFAULT_WORKSPACE_PATH_CONFIG_KEY","configServiceRef","loggerRef","appNameProvider","getSystemDefaultWorkspaceRoot","formatFsReason","warnDefaultWorkspaceRoot","clearConfiguredDefaultWorkspacePath","getDirReadyFailureReason","isDisallowedFilesystemRoot","getWorkspaceRootProbeFailureReason","validateDefaultWorkspaceRoot","resolveDefaultWorkspaceRoot","ensureClawCwd","resolveClawCwd","formatLogDetailsSuffix","safeStringifyLogDetails","serializeLogErrorForDetails","serializeLogErrorCauseForDetails","sanitizeLogDetailValue","SseParser","DEFAULT_CLIENT_CAPABILITIES","fetchWithTimeout","createIdleTimeout","WorkbuddyACPClient","summarizeAcpParamsForLog","serializeAcpErrorForLog","serializeAcpErrorCauseForLog","sanitizeAcpLogValue","safeStringifyAcpLogDetails","WORKBUDDY_AGENT_ACP_CLIENT_CONNECTION_TIMEOUT_MS","WORKBUDDY_AGENT_ACP_CLIENT_POST_TIMEOUT_MS","createWorkbuddyAgentAcpClient","WORKBUDDY_AGENT_ALLOWED_TOOLS","VALID_PERMISSION_MODES$1","normalizeBackendPermissionMode$1","shouldSuppressLegacySystemPrompt","shouldSuppressLegacyTools","buildAgentCliRuntimeArgs","AGENT_CLI_LOCAL_ACP_ENDPOINT_UNAVAILABLE_CODE","AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE","createAgentCliPromptVarsRestoreFailedError","writeAgentCliSystemPromptFile","getAgentCliPromptVarsFilePath","writeAgentCliPromptVarsFile","ensureAgentCliPromptVarsFile","inspectAgentCliPromptVarsFile","areAgentCliPromptVariablesEqual","cleanupAgentCliTempFile","cleanupAgentCliSystemPromptFile","cleanupAgentCliPromptVarsFile","waitForAgentCliLocalAcpEndpoint","createAgentCliLocalAcpEndpointUnavailableError","resolveCliSettingsLanguage","MAX_CACHE_SIZE","MAX_PARAM_LEN","META_TOOL_NAME","META_PERMISSION_RESOLVED","META_TOOL_CALL_ID","META_DECISION","TOOL_BASH","TOOL_WEB_FETCH","MCP_TOOL_PREFIX","TOOL_AUDIT_RULES","MCP_AUDIT_KEYS","createAuditAcpAdapter","isAuditedToolName","buildNamedToolEntry","buildMcpEntry","computeForensicHash","readMeta","readCodeBuddyMeta","readString","hasNonEmptyString","mapToolUpdateStatus","mapPermissionDecision","toAuditDecision","extractErrorMessage","truncateUtf16","isTransientDisconnectMessage","SANDBOX_DISABLED_REASON_META_KEY","TAG","ACP_ENDPOINT_WAIT_TIMEOUT_MS","ACP_CONNECT_TIMEOUT_MS","ACP_CONNECT_RETRY_DELAY_MS","USE_SYSTEM_CA_NODE_OPTION$1","CODEBUDDY_QIMEI36_ENV_KEY","isClawWorkspaceCwd","VALID_PERMISSION_MODES","normalizeBackendPermissionMode","sidecarLog","isProductionBuildLayout","defaultResolveBundledAsset","defaultRequireBundledAsset","defaultGetBootstrapProductConfigEnv","getProxyEnvFromProcess$1","defaultResolveProxyEnv","shouldUseServeMode","isValidHex32","readIsBackgroundAutomationMeta","extractCodeBuddyPromptTraceMeta","extractCliTraceId","extractCliOutcome","extractCliTraceIdFromError","CodeBuddyCodeBackend","CodeBuddyCodeSessionBackend","buildPrewarmActivateArgs","summarizePrewarmArgs","buildArgs","normalizeRuntimeConfig","getRestartIdentity","isPlainObject","stableJsonStringify","isSameRuntimeConfig","waitForEndpoint","withTimeout$1","CLINotFoundError","resolveCLIPath","buildEnv","resolveSandboxNativeEnv","resolveBuiltinSkillsDir","materializeWorkbuddyRuntimePromptRequest","PREPEND_SLASH_COMMAND_ALLOWLIST","materializeWorkbuddyRuntimePrompt","partitionExpertSelectionBlocks","normalizePromptTextForCli","isSupportedPromptImageBlock","summarizePromptRequestForLog","resolveDefaultConfigDirname","serializeBackendErrorForLog","serializeBackendErrorCauseForLog","isRecoverableLocalAcpEndpointUnavailable","isRecoverablePromptTransportError","isTransientAcpDisconnectError","isLoopbackEndpoint","collectBackendErrorChain","sanitizeBackendLogValue","setDefaultWorkspaceRootConfigService","setDefaultWorkspaceRootAppNameProvider"]},{"file":"log-acl-guard.js","sha256":"84d67dcee7d3af2e74cae2af66ac8623260ddfa91b50c452865e773d5adc9c92","regions":[{"from":130477,"to":130495},{"from":130748,"to":130814},{"from":130815,"to":130869}],"names":["aegisReporter","setAegisReporter","getAegisReporter"]}] as const;
export function createNativeCodeSessionBackend(runtime:any={}):any {
const node_os=runtime.os??nodeOs;
const process=runtime.process??globalThis.process,console=runtime.console??globalThis.console,fetch=runtime.fetch??globalThis.fetch,path=node_path;
const require_gateway_secret=runtime.gateway??createNativeSessionReplayTransport();
const require_proxy_env=createNativeSidecarProxyEnvironment();
const require_client_info_env=createNativeSidecarClientInfo({process});
const require_cli_product_env=createNativeSidecarCliProductEnvironment({process});
const require_cli_process_env=createNativeSidecarEnvironment({process});
const require_cli_prewarm_pool={...createNativeSidecarManager({process,gateway:require_gateway_secret}),...createNativeCliPrewarmPool({process,environment:require_cli_process_env})};
const require_workbuddy_auth_product_coordinator=(()=>{
var CONNECTOR_PROXY_MCP_NAME = "connector-proxy";
var WORKBUDDY_SESSION_ID_HEADER = "X-WorkBuddy-Session-Id";
var WORKBUDDY_WELCOME_MODE_HEADER = "X-WorkBuddy-Welcome-Mode";
var SYSTEM_REMINDER_BLOCK_RE = /<system-reminder\b[^>]*>[\s\S]*?<\/system-reminder>\s*/g;
function escapeXmlAttribute$1(value) {
	return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function stripSystemReminderXml(text) {
	return text.replace(SYSTEM_REMINDER_BLOCK_RE, "");
}
function wrapUserQueryXml(text) {
	return `<user_query>${text}</user_query>`;
}
var ACP_RESOURCE_LINK_PROVIDER_DATA_KEY = "acpResourceLink";
var COMMAND_URI_PREFIX = "command://";
var FILE_URI_PREFIX = "file://";
var SCENE_URI_PREFIX = "scene://";
var SKILL_URI_PREFIX = "skill://";
var TDOC_URI_PREFIX = "tdoc://";
var IMA_URI_PREFIX = "ima://";
var LEXIANG_URI_PREFIX = "lexiang://";
var NETDRIVE_URI_PREFIX = "netdrive://";
var SELECTION_URI_PREFIX = "selection://";
var COMMENT_URI_PREFIX = "comment://";
var TDOC_SELECTION_URI_PREFIX = "tdoc-selection://";
var AGENTMAIL_URI_PREFIX = "agentmail://";
var EXPERT_URI_PREFIX = "expert://";
var ARTICLE_URI_PREFIX = "article://";
var HTTP_URI_PREFIX = "http://";
var HTTPS_URI_PREFIX = "https://";
var BARE_BADGE_CHAR_RE = /[A-Za-z0-9_./-]/;
var WORDISH_CHAR_RE = /[\p{L}\p{N}_-]/u;
function getAcpResourceLinkDisplayName(uri, name) {
	if (uri.startsWith(COMMAND_URI_PREFIX)) {
		const commandName = name || uri.slice(10);
		return commandName.startsWith("/") ? commandName : `/${commandName}`;
	}
	if (name) return name;
	return uri.replace(/\/+$/, "").split("/").pop() || uri;
}
function encodeAcpResourceLinkToInputText(block) {
	const displayName = getAcpResourceLinkDisplayName(block.uri, block.name);
	const inlinePromptText = getInlinePromptResourceText(block.meta);
	if (block.uri.startsWith(AGENTMAIL_URI_PREFIX)) {
		const hint = {
			uri: block.uri,
			name: displayName,
			...collectAgentMailProviderHint(block.meta)
		};
		return {
			text: `@agentmail:${encodeInlineBadgeValue(displayName)}`,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: hint }
		};
	}
	if (inlinePromptText) return { text: `@${inlinePromptText}` };
	if (block.meta?.provider === "space-doc" && block.meta?.kind === "space/doc-ref") return {
		text: typeof block.meta.url === "string" && block.meta.url ? block.meta.url : block.uri,
		providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
			uri: block.uri,
			name: displayName
		} }
	};
	if (block.uri.startsWith(COMMAND_URI_PREFIX)) return {
		text: displayName,
		providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
			uri: block.uri,
			name: displayName
		} }
	};
	if (block.uri.startsWith(SCENE_URI_PREFIX)) {
		const sceneId = block.uri.slice(8);
		const sceneName = block.name || sceneId;
		return { text: block.name && sceneId && block.name !== sceneId && isBareInlineBadgeValue(sceneId) ? `@scene#${sceneId}:${encodeInlineBadgeValue(sceneName)}` : `@scene:${encodeInlineBadgeValue(sceneName)}` };
	}
	if (block.uri.startsWith(SKILL_URI_PREFIX)) return { text: `@skill:${encodeInlineBadgeValue(block.name || block.uri.slice(8))}` };
	if (block.uri.startsWith(TDOC_URI_PREFIX)) {
		const fileId = block.uri.slice(7);
		const displayTitle = block.name || fileId;
		const tencentDocsHint = collectTencentDocsProviderHint(block.meta);
		return {
			text: fileId ? `@tdoc#${encodeURIComponent(fileId)}:${encodeInlineBadgeValue(displayTitle)}` : `@tdoc:${encodeInlineBadgeValue(displayTitle)}`,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: displayTitle,
				...tencentDocsHint
			} }
		};
	}
	if (block.uri.startsWith(SELECTION_URI_PREFIX)) {
		const selectedText = typeof block.meta?.selectedText === "string" ? block.meta.selectedText : "";
		const llmText = typeof block.meta?.llmText === "string" ? block.meta.llmText : "";
		const sourceFile = block.uri.slice(12);
		const badge = `@selection:${encodeInlineBadgeValue(displayName)}`;
		const titleAttr = typeof block.meta?.title === "string" && block.meta.title ? ` title="${escapeXmlAttribute$1(block.meta.title)}"` : "";
		const htmlSelAttr = block.meta?.htmlSelection ? " htmlSelection=\"true\"" : "";
		const appendLlmContext = llmText ? ` <system-reminder>${llmText}</system-reminder>` : "";
		const reminder = selectedText ? `<selection_quote source="${escapeXmlAttribute$1(sourceFile)}"${titleAttr}${htmlSelAttr}>${selectedText}</selection_quote>${appendLlmContext}` : "";
		return {
			text: reminder ? `${badge} ${reminder}` : badge,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: displayName,
				...block.meta?.htmlSelection ? { htmlSelection: true } : {}
			} }
		};
	}
	if (block.uri.startsWith(COMMENT_URI_PREFIX)) {
		const llmText = typeof block.meta?.llmText === "string" ? block.meta.llmText : "";
		const badge = `@comment:${encodeInlineBadgeValue(displayName)}`;
		const appendLlmContext = llmText ? ` <system-reminder>${llmText}</system-reminder>` : "";
		const hint = {
			uri: block.uri,
			name: displayName
		};
		return {
			text: appendLlmContext ? `${badge}${appendLlmContext}` : badge,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				...hint,
				...collectCommentProviderHint(block.meta)
			} }
		};
	}
	if (block.uri.startsWith(TDOC_SELECTION_URI_PREFIX)) {
		const selectionRef = readTDocSelectionTimestampRefFromHint(block.meta);
		const selectionDisplayName = readTDocSelectionDisplayNameFromHint(block.meta, displayName);
		return {
			text: selectionRef ? formatTDocSelectionBadge(selectionDisplayName, selectionRef) : selectionDisplayName,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: selectionDisplayName,
				...selectionRef ? { selectionRef } : {}
			} }
		};
	}
	if (block.uri.startsWith(IMA_URI_PREFIX)) {
		const ref = block.uri.slice(6);
		const displayTitle = block.name || ref;
		return {
			text: `@ima:${encodeInlineBadgeValue(displayTitle)}`,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: displayTitle
			} }
		};
	}
	if (block.uri.startsWith(LEXIANG_URI_PREFIX)) {
		const displayTitle = block.name || block.uri.slice(10);
		const lexiangHint = collectLexiangProviderHint(block.meta);
		return {
			text: `@lexiang:${encodeInlineBadgeValue(displayTitle)}`,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: displayTitle,
				...lexiangHint
			} }
		};
	}
	if (block.uri.startsWith(NETDRIVE_URI_PREFIX)) {
		const displayTitle = block.name || block.uri.slice(11);
		return {
			text: `@netdrive:${encodeInlineBadgeValue(displayTitle)}`,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: displayTitle
			} }
		};
	}
	if (block.uri.startsWith(EXPERT_URI_PREFIX)) {
		const expertId = block.uri.slice(9);
		const displayName2 = block.name || expertId;
		return {
			text: `@expert:${encodeInlineBadgeValue(expertId)}`,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: displayName2
			} }
		};
	}
	if (block.uri.startsWith(ARTICLE_URI_PREFIX)) {
		const url = block.uri.slice(10);
		return {
			text: `@article:${url}`,
			providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
				uri: block.uri,
				name: block.name || url
			} }
		};
	}
	if (block.uri.startsWith(FILE_URI_PREFIX)) return { text: `@${encodeInlineBadgeValue(block.relativePath || block.name || decodeFileUriPath(block.uri) || displayName)}` };
	if (block.uri.startsWith(HTTPS_URI_PREFIX) || block.uri.startsWith(HTTP_URI_PREFIX)) return {
		text: `@share-html:${block.uri}`,
		providerData: { [ACP_RESOURCE_LINK_PROVIDER_DATA_KEY]: {
			uri: block.uri,
			name: displayName
		} }
	};
	return { text: displayName };
}
function isInlineEncodableResourceLink(block) {
	if (typeof block.uri !== "string") return false;
	if (getInlinePromptResourceText(block.meta)) return true;
	if (block.meta?.provider === "space-doc" && block.meta?.kind === "space/doc-ref") return true;
	if (block.uri.startsWith(COMMAND_URI_PREFIX) || block.uri.startsWith(FILE_URI_PREFIX) || block.uri.startsWith(SCENE_URI_PREFIX) || block.uri.startsWith(SKILL_URI_PREFIX) || block.uri.startsWith(TDOC_URI_PREFIX) || block.uri.startsWith(NETDRIVE_URI_PREFIX) || block.uri.startsWith(SELECTION_URI_PREFIX) || block.uri.startsWith(COMMENT_URI_PREFIX) || block.uri.startsWith(TDOC_SELECTION_URI_PREFIX) || block.uri.startsWith(EXPERT_URI_PREFIX) || block.uri.startsWith(ARTICLE_URI_PREFIX) || block.uri.startsWith(HTTPS_URI_PREFIX) || block.uri.startsWith(HTTP_URI_PREFIX)) return true;
	const mentionType = typeof block.meta?.mentionType === "string" ? block.meta.mentionType : void 0;
	return mentionType === "file" || mentionType === "folder";
}
function isRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function readString$3(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function readPresentSelectionText(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function formatDocumentSelectionContextText(text) {
	if (text.length === 0) return "";
	if (!text.includes("\n")) return text.trim().length === 0 ? text : text.trim();
	return text.replace(/\s*\n+\s*/g, " ⏎ ").trim();
}
function readFormattedSelectionDisplayText(value) {
	const present = readPresentSelectionText(value);
	return present !== void 0 ? formatDocumentSelectionContextText(present) : void 0;
}
function readTDocSelectionTimestampRef(value) {
	if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return String(value);
	const text = readString$3(value);
	return text && isTDocSelectionTimestampRef(text) ? text : void 0;
}
function isTDocSelectionTimestampRef(value) {
	return /^[0-9]+$/.test(value);
}
function readTDocSelectionTimestampRefFromHint(hint) {
	if (!hint) return;
	return readTDocSelectionTimestampRef((isRecord(hint.selectionPayload) ? hint.selectionPayload : void 0)?.timestamp) ?? readTDocSelectionTimestampRef(hint.timestamp) ?? readTDocSelectionTimestampRef(hint.selectionRef);
}
function readTDocSelectionDisplayNameFromHint(hint, fallback) {
	const payload = isRecord(hint?.selectionPayload) ? hint.selectionPayload : void 0;
	return readFormattedSelectionDisplayText(payload?.text) ?? readFormattedSelectionDisplayText(payload?.description) ?? (isRecord(payload?.image) ? "图片选区" : void 0) ?? fallback;
}
function formatTDocSelectionBadge(displayName, selectionRef) {
	return `${formatTDocSelectionRefBadge(selectionRef)}:${encodeInlineBadgeValue(displayName)}`;
}
function formatTDocSelectionRefBadge(selectionRef) {
	return `@tdoc-selection#${encodeURIComponent(selectionRef)}`;
}
function collectAgentMailProviderHint(meta) {
	if (!meta || typeof meta !== "object") return {};
	const hint = {};
	for (const key of [
		"message_id",
		"subject",
		"sender",
		"from",
		"created_at",
		"snippet",
		"agentMail"
	]) if (meta[key] !== void 0) hint[key] = meta[key];
	return hint;
}
function collectCommentProviderHint(meta) {
	if (!meta || typeof meta !== "object") return {};
	const hint = {};
	for (const key of [
		"spaceId",
		"nodeId",
		"discussionId",
		"llmText",
		"sourceUrl"
	]) if (meta[key] !== void 0) hint[key] = meta[key];
	return hint;
}
function collectTencentDocsProviderHint(meta) {
	if (!meta || typeof meta !== "object") return {};
	const hint = {};
	for (const key of [
		"fileId",
		"fileUrl",
		"rawUrl",
		"url",
		"fileType",
		"fileExt",
		"fileSize",
		"ownerName",
		"title",
		"displayText"
	]) if (meta[key] !== void 0) hint[key] = meta[key];
	return hint;
}
function collectLexiangProviderHint(meta) {
	if (!meta || typeof meta !== "object") return {};
	const hint = {};
	if (typeof meta.iconUrl === "string" && meta.iconUrl) hint.iconUrl = meta.iconUrl;
	else if (meta.icon && typeof meta.icon === "object" && typeof meta.icon.url === "string") {
		const url = meta.icon.url;
		if (url) hint.iconUrl = url;
	}
	if (typeof meta.extension === "string" && meta.extension) hint.extension = meta.extension;
	if (typeof meta.kind === "string" && meta.kind) hint.kind = meta.kind;
	if (typeof meta.isFolder === "boolean") hint.isFolder = meta.isFolder;
	else if (typeof meta.entityType === "string") hint.isFolder = meta.entityType === "folder";
	return hint;
}
function extractRuntimePromptText(prompt) {
	if (!Array.isArray(prompt) || prompt.length === 0) return "";
	const hiddenContextTexts = [];
	let visibleText = "";
	let imageOrdinal = 0;
	for (const block of prompt) {
		if (!block || typeof block !== "object") continue;
		if (block.type === "text" && typeof block.text === "string") {
			const rawText = block.text;
			if (rawText.includes("<system-reminder")) {
				const hiddenText = rawText.trim();
				if (hiddenText) hiddenContextTexts.push(hiddenText);
				continue;
			}
			const visibleTextPiece = stripSystemReminderXml(rawText).trim();
			if (visibleTextPiece) visibleText = appendInlineTextPiece(visibleText, visibleTextPiece);
			continue;
		}
		if (block.type === "resource_link" && typeof block.uri === "string") {
			const meta = block._meta || {};
			const encoded = encodeAcpResourceLinkToInputText({
				uri: toInlineEncodableResourceUri(block.uri, typeof meta.mentionType === "string" ? meta.mentionType : void 0, typeof meta.relativePath === "string" ? meta.relativePath : void 0),
				name: typeof block.name === "string" ? block.name : void 0,
				relativePath: typeof meta.relativePath === "string" ? meta.relativePath : void 0,
				meta
			}).text;
			visibleText = appendInlineTextPiece(visibleText, encoded);
			continue;
		}
		if (block.type === "image" && (typeof block.data === "string" || typeof block.uri === "string")) {
			imageOrdinal += 1;
			visibleText = appendInlineTextPiece(visibleText, createInlineImageBadgeToken(block, imageOrdinal));
		}
	}
	const parts = [];
	if (hiddenContextTexts.length > 0) parts.push(hiddenContextTexts.join("\n"));
	if (visibleText) parts.push(wrapUserQueryXml(visibleText));
	return parts.join("\n");
}
function createInlineImageBadgeToken(block, ordinal) {
	return `@image#${ordinal}:${encodeInlineBadgeValue(getInlineImageLabel(block, ordinal))}`;
}
function getInlinePromptResourceText(meta) {
	if (meta?.mentionType !== "inline-prompt") return;
	if (typeof meta.promptText === "string" && meta.promptText.trim()) return meta.promptText.trim();
}
function getInlineImageLabel(block, ordinal) {
	const filename = block._meta?.filename || block._meta?.originalFilename || getLastPathSegment(block.uri) || `image-${ordinal}`;
	return String(filename);
}
function decodeFileUriPath(uri) {
	if (!uri.startsWith(FILE_URI_PREFIX)) return;
	return decodeURIComponentSafe$1(uri.slice(7));
}
function decodeURIComponentSafe$1(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function encodeInlineBadgeValue(value) {
	if (isBareInlineBadgeValue(value)) return value;
	return `"${value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
}
function isBareInlineBadgeValue(value) {
	return value.length > 0 && !value.includes("\"") && !value.includes("\\") && Array.from(value).every((char) => BARE_BADGE_CHAR_RE.test(char));
}
function appendInlineTextPiece(current, piece) {
	if (!piece) return current;
	if (!current) return piece;
	const prevChar = current[current.length - 1];
	const nextChar = piece[0];
	if (needsInlineSeparator(prevChar, nextChar)) return `${current} ${piece}`;
	return `${current}${piece}`;
}
function needsInlineSeparator(prevChar, nextChar) {
	if (!prevChar || !nextChar) return false;
	if (/\s/u.test(prevChar) || /\s/u.test(nextChar)) return false;
	const leftTokenish = WORDISH_CHAR_RE.test(prevChar) || prevChar === "@" || prevChar === "/" || prevChar === "\"";
	const rightTokenish = WORDISH_CHAR_RE.test(nextChar) || nextChar === "@" || nextChar === "/";
	return leftTokenish && rightTokenish;
}
function getLastPathSegment(pathOrUri) {
	if (!pathOrUri) return;
	return pathOrUri.replace(/\/+$/, "").split("/").pop() || void 0;
}
function toInlineEncodableResourceUri(uri, mentionType, relativePath) {
	if (uri.includes("://")) return uri;
	if (mentionType === "file" || mentionType === "folder") return `${FILE_URI_PREFIX}${relativePath || uri}`;
	return uri;
}
var WORKBUDDY_PROJECT_ID_HEADER = "X-WorkBuddy-Project-Id";
function resolveResponseLocaleIsZh(configured, systemLocale) {
	return (typeof configured === "string" && configured.trim() ? configured.trim() : systemLocale).toLowerCase().startsWith("zh");
}
return {resolveResponseLocaleIsZh,CONNECTOR_PROXY_MCP_NAME,WORKBUDDY_SESSION_ID_HEADER,WORKBUDDY_WELCOME_MODE_HEADER,SYSTEM_REMINDER_BLOCK_RE,escapeXmlAttribute$1,stripSystemReminderXml,wrapUserQueryXml,ACP_RESOURCE_LINK_PROVIDER_DATA_KEY,COMMAND_URI_PREFIX,FILE_URI_PREFIX,SCENE_URI_PREFIX,SKILL_URI_PREFIX,TDOC_URI_PREFIX,IMA_URI_PREFIX,LEXIANG_URI_PREFIX,NETDRIVE_URI_PREFIX,SELECTION_URI_PREFIX,COMMENT_URI_PREFIX,TDOC_SELECTION_URI_PREFIX,AGENTMAIL_URI_PREFIX,EXPERT_URI_PREFIX,ARTICLE_URI_PREFIX,HTTP_URI_PREFIX,HTTPS_URI_PREFIX,BARE_BADGE_CHAR_RE,WORDISH_CHAR_RE,getAcpResourceLinkDisplayName,encodeAcpResourceLinkToInputText,isInlineEncodableResourceLink,isRecord,readString$3,readPresentSelectionText,formatDocumentSelectionContextText,readFormattedSelectionDisplayText,readTDocSelectionTimestampRef,isTDocSelectionTimestampRef,readTDocSelectionTimestampRefFromHint,readTDocSelectionDisplayNameFromHint,formatTDocSelectionBadge,formatTDocSelectionRefBadge,collectAgentMailProviderHint,collectCommentProviderHint,collectTencentDocsProviderHint,collectLexiangProviderHint,extractRuntimePromptText,createInlineImageBadgeToken,getInlinePromptResourceText,getInlineImageLabel,decodeFileUriPath,decodeURIComponentSafe$1,encodeInlineBadgeValue,isBareInlineBadgeValue,appendInlineTextPiece,needsInlineSeparator,getLastPathSegment,toInlineEncodableResourceUri,WORKBUDDY_PROJECT_ID_HEADER};
})();
const require_log_acl_guard=(()=>{
var aegisReporter;
function setAegisReporter(reporter) {
	aegisReporter = reporter;
}
function getAegisReporter() {
	return aegisReporter;
}
return {setAegisReporter,getAegisReporter};
})();
function isRecord$10(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function stableStringify(value) {
	if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
	if (isRecord$10(value)) return `{${Object.keys(value).sort().filter((key) => value[key] !== void 0).map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
	return JSON.stringify(value);
}
function sha256Hex(content) {
	return (0, node_crypto.createHash)("sha256").update(content).digest("hex");
}
function commandHash(command) {
	return sha256Hex(command);
}
var DEFAULT_WORKSPACE_PATH_CONFIG_KEY = "defaultWorkspacePath";
var configServiceRef = null;
var loggerRef = null;
var appNameProvider = null;
function getSystemDefaultWorkspaceRoot() {
	const appName = appNameProvider?.() || process.env.WORKBUDDY_APP_NAME?.trim() || "WorkBuddy";
	return node_path.join(node_os.homedir(), appName);
}
function formatFsReason(error) {
	const e = error;
	return e?.code ? `${e.code}: ${e.message}` : String(error);
}
function warnDefaultWorkspaceRoot(message, details) {
	loggerRef?.warn(`[DefaultWorkspaceRoot] ${message}`, details);
}
function clearConfiguredDefaultWorkspacePath(stored, reason) {
	if (stored === null || stored === void 0 || stored === "") return;
	warnDefaultWorkspaceRoot("Invalid defaultWorkspacePath detected, clearing config before fallback", {
		stored,
		reason
	});
	try {
		configServiceRef?.set?.(DEFAULT_WORKSPACE_PATH_CONFIG_KEY, "");
		warnDefaultWorkspaceRoot("Cleared invalid defaultWorkspacePath config", {
			stored,
			reason
		});
	} catch (error) {
		warnDefaultWorkspaceRoot("Failed to clear invalid defaultWorkspacePath config, continuing fallback", {
			stored,
			reason,
			error: formatFsReason(error)
		});
	}
}
function getDirReadyFailureReason(dir) {
	try {
		if (node_fs.statSync(dir).isDirectory()) return;
		return "path exists but is not a directory";
	} catch (error) {
		const e = error;
		if (e?.code && e.code !== "ENOENT") return `cannot access directory (${formatFsReason(error)})`;
	}
	try {
		node_fs.mkdirSync(dir, { recursive: true });
		return;
	} catch (error) {
		return `cannot create directory (${formatFsReason(error)})`;
	}
}
function isDisallowedFilesystemRoot(dir) {
	const normalized = node_path.normalize(dir);
	return normalized === node_path.sep && node_path.parse(normalized).root === normalized;
}
function getWorkspaceRootProbeFailureReason(root) {
	const prefix = node_path.join(root, `.workbuddy-probe-${process.pid}-`);
	let probeDir;
	try {
		probeDir = node_fs.mkdtempSync(prefix);
	} catch (error) {
		return `cannot create probe directory (${formatFsReason(error)})`;
	}
	try {
		node_fs.rmSync(probeDir, {
			recursive: true,
			force: true
		});
		return;
	} catch (error) {
		return `created probe directory but failed to remove it (${formatFsReason(error)})`;
	}
}
function validateDefaultWorkspaceRoot(candidate) {
	if (typeof candidate !== "string") return {
		ok: false,
		reason: "path is not a string"
	};
	const trimmed = candidate.trim();
	if (!trimmed) return {
		ok: false,
		reason: "path is empty"
	};
	if (!node_path.isAbsolute(trimmed)) return {
		ok: false,
		reason: "path is not absolute"
	};
	if (isDisallowedFilesystemRoot(trimmed)) return {
		ok: false,
		reason: "filesystem root cannot be used as workspace root"
	};
	const dirFailure = getDirReadyFailureReason(trimmed);
	if (dirFailure) return {
		ok: false,
		reason: dirFailure
	};
	const probeFailure = getWorkspaceRootProbeFailureReason(trimmed);
	if (probeFailure) return {
		ok: false,
		reason: probeFailure
	};
	return {
		ok: true,
		root: trimmed
	};
}
function resolveDefaultWorkspaceRoot() {
	if (configServiceRef) try {
		const stored = configServiceRef.get(DEFAULT_WORKSPACE_PATH_CONFIG_KEY);
		const validation = validateDefaultWorkspaceRoot(stored);
		if (validation.ok) return validation.root;
		clearConfiguredDefaultWorkspacePath(stored, validation.reason);
	} catch {}
	const fallback = getSystemDefaultWorkspaceRoot();
	const validation = validateDefaultWorkspaceRoot(fallback);
	if (validation.ok) return validation.root;
	return fallback;
}
function ensureClawCwd(root) {
	const clawCwd = node_path.join(root, "Claw");
	try {
		node_fs.mkdirSync(clawCwd, { recursive: true });
	} catch (err) {
		throw new Error(`Failed to create Claw workspace directory "${clawCwd}" (${formatFsReason(err)}). Please verify the default workspace path in Settings exists and is writable.`);
	}
	let st;
	try {
		st = node_fs.statSync(clawCwd);
	} catch (err) {
		const e = err;
		throw new Error(`Claw workspace directory "${clawCwd}" is not accessible (${e?.code ?? "UNKNOWN"}: ${e?.message ?? err}).`);
	}
	if (!st.isDirectory()) throw new Error(`Claw workspace path "${clawCwd}" exists but is not a directory. Remove or rename the file at that path and try again.`);
	return clawCwd;
}
function resolveClawCwd() {
	const root = resolveDefaultWorkspaceRoot();
	try {
		return ensureClawCwd(root);
	} catch (error) {
		const fallback = getSystemDefaultWorkspaceRoot();
		if (node_path.resolve(root) !== node_path.resolve(fallback)) {
			clearConfiguredDefaultWorkspacePath(root, error instanceof Error ? error.message : String(error));
			try {
				const fallbackCwd = ensureClawCwd(fallback);
				warnDefaultWorkspaceRoot("Fell back to system default Claw workspace directory", {
					failedRoot: root,
					fallbackRoot: fallback,
					fallbackCwd
				});
				return fallbackCwd;
			} catch (fallbackError) {
				throw new Error(`${String(error)} Fallback Claw workspace directory also failed (${formatFsReason(fallbackError)}).`);
			}
		}
		throw error;
	}
}
function formatLogDetailsSuffix(details) {
	if (details === void 0) return "";
	const detailsText = safeStringifyLogDetails(details);
	return detailsText ? ` ${detailsText}` : "";
}
function safeStringifyLogDetails(details) {
	if (details === null || details === void 0) return "";
	if (typeof details === "string") return details;
	try {
		return JSON.stringify(details, (_key, value) => {
			if (value instanceof Error) return serializeLogErrorForDetails(value);
			if (typeof value === "bigint") return value.toString();
			return value;
		});
	} catch {
		try {
			return String(details);
		} catch {
			return "[unserializable-log-details]";
		}
	}
}
function serializeLogErrorForDetails(error) {
	if (error instanceof Error) {
		const errorWithExtras = error;
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			code: errorWithExtras.code,
			data: sanitizeLogDetailValue(errorWithExtras.data),
			cause: errorWithExtras.cause ? serializeLogErrorCauseForDetails(errorWithExtras.cause) : void 0
		};
	}
	return { message: String(error) };
}
function serializeLogErrorCauseForDetails(error) {
	if (error instanceof Error) return serializeLogErrorForDetails(error);
	return String(error);
}
function sanitizeLogDetailValue(value, depth = 0) {
	if (depth >= 3) return "[truncated]";
	if (value == null || typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
	if (Array.isArray(value)) return value.slice(0, 10).map((item) => sanitizeLogDetailValue(item, depth + 1));
	if (value instanceof Error) return serializeLogErrorForDetails(value);
	if (typeof value === "object") {
		const entries = Object.entries(value).slice(0, 20);
		return Object.fromEntries(entries.map(([key, nested]) => [key, sanitizeLogDetailValue(nested, depth + 1)]));
	}
	return String(value);
}
var SseParser = class {
	pendingLine = [];
	currentEvent = "";
	currentData = [];
	feed(chunk) {
		const events = [];
		let start = 0;
		let newlineIndex = chunk.indexOf("\n", start);
		while (newlineIndex !== -1) {
			this.pendingLine.push(chunk.slice(start, newlineIndex));
			const line = this.pendingLine.length === 1 ? this.pendingLine[0] : this.pendingLine.join("");
			this.pendingLine.length = 0;
			this.processLine(line, events);
			start = newlineIndex + 1;
			newlineIndex = chunk.indexOf("\n", start);
		}
		if (start < chunk.length) this.pendingLine.push(chunk.slice(start));
		return events;
	}
	processLine(line, events) {
		if (line === "" || line === "\r") {
			if (this.currentData.length > 0) events.push({
				event: this.currentEvent || "message",
				data: this.currentData.join("\n")
			});
			this.currentEvent = "";
			this.currentData.length = 0;
			return;
		}
		if (line.startsWith(":")) return;
		if (line.startsWith("event:")) {
			this.currentEvent = line.slice(6).trim();
			return;
		}
		if (line.startsWith("data:")) this.currentData.push(line.slice(5).trimStart());
	}
	flush() {
		const events = this.feed("\n\n");
		this.pendingLine.length = 0;
		return events;
	}
};
var DEFAULT_CLIENT_CAPABILITIES = {
	fs: {
		readTextFile: false,
		writeTextFile: false
	},
	_meta: {
		"codebuddy.ai": {
			question: true,
			promptSuggestion: true,
			fileReferencesPathOnly: true
		},
		"workbuddy.desktop": { detailedCheckpoint: true }
	}
};
async function fetchWithTimeout(input, init, timeoutMs, label) {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return fetch(input, init);
	const controller = new AbortController();
	const timer = setTimeout(() => {
		controller.abort(/* @__PURE__ */ new Error(`${label} timeout after ${timeoutMs}ms`));
	}, timeoutMs);
	try {
		return await fetch(input, {
			...init,
			signal: controller.signal
		});
	} catch (error) {
		if (error.name === "AbortError") throw new Error(`${label} timeout after ${timeoutMs}ms`);
		throw error;
	} finally {
		clearTimeout(timer);
	}
}
function createIdleTimeout(timeoutMs, onTimeout) {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return {
		touch: () => {},
		clear: () => {}
	};
	let timer = null;
	const schedule = () => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(onTimeout, timeoutMs);
	};
	schedule();
	return {
		touch: schedule,
		clear: () => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		}
	};
}
var WorkbuddyACPClient = class {
	credentials = null;
	nextId = 1;
	pendingPermissions = /* @__PURE__ */ new Map();
	pendingQuestions = /* @__PURE__ */ new Map();
	pendingElicitations = /* @__PURE__ */ new Map();
	pendingRequests = /* @__PURE__ */ new Map();
	sseAbortController = null;
	getSseTask = null;
	connecting = null;
	connectionGeneration = 0;
	connection;
	constructor(options) {
		this.options = options;
		this.connection = {
			newSession: async (params) => this.request("session/new", params),
			loadSession: async (params) => this.request("session/load", params),
			resumeSession: async (params) => this.request("session/resume", params),
			prompt: async (params) => this.request("session/prompt", params),
			cancel: async (params) => this.notify("session/cancel", params),
			setSessionMode: async (params) => this.request("session/set_mode", params),
			unstable_setSessionModel: async (params) => this.request("session/set_model", params),
			extMethod: async (method, params) => this.request(method, params)
		};
	}
	get connectionId() {
		return this.credentials?.connectionId;
	}
	debugState() {
		return {
			endpoint: this.options.endpoint,
			connectionId: this.credentials?.connectionId,
			hasSessionToken: !!this.credentials?.sessionToken,
			pendingRequests: this.pendingRequests.size
		};
	}
	async connect() {
		if (this.connecting) return this.connecting;
		this.connecting = (async () => {
			await this.disconnect();
			const connectGeneration = this.connectionGeneration;
			const connectionTimeoutMs = this.options.connectionTimeout ?? 3e4;
			const connectResponse = await fetchWithTimeout(`${this.options.endpoint}/connect`, {
				method: "POST",
				headers: this.buildConnectHeaders()
			}, connectionTimeoutMs, "ACP connect");
			if (!connectResponse.ok) throw new Error(`ACP connect failed: ${connectResponse.status} ${connectResponse.statusText}`);
			const payload = await connectResponse.json();
			if (!payload.connectionId) throw new Error("ACP connect response missing connectionId");
			const credentials = {
				connectionId: payload.connectionId,
				sessionToken: payload.sessionToken ?? null
			};
			if (this.connectionGeneration !== connectGeneration) {
				this.logDiagnostic("info", "ACP connect completed after disconnect; closing late connection", {
					connectionId: credentials.connectionId,
					endpoint: this.options.endpoint
				});
				await this.closeConnection(credentials);
				throw new Error("ACP connect aborted after disconnect");
			}
			this.credentials = credentials;
			this.sseAbortController = new AbortController();
			this.getSseTask = this.tryEstablishGetSse(this.sseAbortController.signal).catch(() => {});
			const clientCapabilities = this.options.supportsElicitation ? {
				...DEFAULT_CLIENT_CAPABILITIES,
				elicitation: {
					form: {},
					url: {}
				},
				_meta: {
					...DEFAULT_CLIENT_CAPABILITIES._meta,
					"codebuddy.ai": {
						...DEFAULT_CLIENT_CAPABILITIES._meta["codebuddy.ai"],
						weixinpay: { interception: true }
					}
				}
			} : DEFAULT_CLIENT_CAPABILITIES;
			this.options.logger?.info?.(`[WorkbuddyAcpClient] initialize: supportsElicitation=${!!this.options.supportsElicitation} hasElicitationForm=${!!clientCapabilities.elicitation?.form} hasWeixinpayInterception=${!!clientCapabilities._meta?.["codebuddy.ai"]?.weixinpay?.interception}`);
			await this.request("initialize", {
				protocolVersion: 1,
				clientInfo: {
					name: "workbuddy-acp-client",
					version: "1.0.0"
				},
				clientCapabilities
			});
		})();
		try {
			await this.connecting;
		} finally {
			this.connecting = null;
		}
	}
	async disconnect() {
		this.connectionGeneration += 1;
		this.sseAbortController?.abort();
		this.sseAbortController = null;
		const credentials = this.credentials;
		this.credentials = null;
		this.rejectPendingRequests(/* @__PURE__ */ new Error("disconnected"));
		this.pendingPermissions.clear();
		this.pendingQuestions.clear();
		this.pendingElicitations.clear();
		if (credentials) await this.closeConnection(credentials);
		await this.getSseTask?.catch(() => {});
		this.getSseTask = null;
	}
	resolvePermission(requestId, optionId) {
		const pending = this.pendingPermissions.get(requestId);
		if (!pending) return false;
		this.pendingPermissions.delete(requestId);
		this.sendJsonRpcResult(pending.jsonRpcId, { outcome: {
			outcome: "selected",
			optionId
		} }).catch(() => {});
		return true;
	}
	rejectPermission(requestId, reason) {
		const pending = this.pendingPermissions.get(requestId);
		if (!pending) return false;
		this.pendingPermissions.delete(requestId);
		this.sendJsonRpcResult(pending.jsonRpcId, { outcome: {
			outcome: "cancelled",
			...reason ? { reason } : {}
		} }).catch(() => {});
		return true;
	}
	answerQuestion(toolCallId, answers) {
		const pending = this.pendingQuestions.get(toolCallId);
		if (!pending) return false;
		this.pendingQuestions.delete(toolCallId);
		this.sendJsonRpcResult(pending.jsonRpcId, { outcome: {
			outcome: "submitted",
			data: { answers }
		} }).catch(() => {});
		return true;
	}
	cancelQuestion(toolCallId, reason) {
		const pending = this.pendingQuestions.get(toolCallId);
		if (!pending) return false;
		this.pendingQuestions.delete(toolCallId);
		this.sendJsonRpcResult(pending.jsonRpcId, { outcome: {
			outcome: "cancelled",
			...reason ? { reason } : {}
		} }).catch(() => {});
		return true;
	}
	/**
	* Send _codebuddy.ai/resolveInterruption extMethod to the ACP agent.
	* This is the correct path for AskUserQuestion in Desktop: it carries both
	* the approval decision AND the user's answers so that askService.doneAsk()
	* is called on the CLI side.
	*/
	async resolveInterruption(sessionId, toolCallId, decision, answers) {
		this.logDiagnostic("info", `[AcpClient] resolveInterruption: sending extMethod, sessionId=${sessionId}, toolCallId=${toolCallId}, decision=${decision}`);
		try {
			const result = await this.connection.extMethod("_codebuddy.ai/resolveInterruption", {
				sessionId,
				toolCallId,
				decision,
				...answers ? { answers } : {}
			});
			const resolution = {
				resolved: result.resolved === true,
				queued: result.queued === true
			};
			this.logDiagnostic("info", `[AcpClient] resolveInterruption: extMethod succeeded resolved=${resolution.resolved} queued=${resolution.queued}`);
			return resolution;
		} catch (err) {
			this.logDiagnostic("error", `[AcpClient] resolveInterruption: extMethod failed: ${err}`);
			return {
				resolved: false,
				queued: false
			};
		}
	}
	async request(method, params) {
		const id = this.nextId++;
		const paramsSummary = summarizeAcpParamsForLog(method, params);
		const message = {
			jsonrpc: "2.0",
			id,
			method,
			...params !== void 0 ? { params } : {}
		};
		const responsePromise = new Promise((resolve, reject) => {
			this.pendingRequests.set(id, {
				resolve,
				reject,
				method,
				paramsSummary
			});
		});
		responsePromise.catch(() => {});
		const transportPromise = this.postJsonRpc(message, true).catch((error) => {
			const pending = this.pendingRequests.get(id);
			if (!pending) return;
			this.pendingRequests.delete(id);
			const normalizedError = this.normalizeTransportError(error instanceof Error ? error : new Error(String(error)));
			this.logDiagnostic("error", "ACP request transport failed", {
				requestId: id,
				method,
				connectionId: this.credentials?.connectionId,
				endpoint: this.options.endpoint,
				params: pending.paramsSummary,
				error: serializeAcpErrorForLog(normalizedError)
			});
			pending.reject(normalizedError);
		});
		if (method !== "session/prompt") await transportPromise;
		return responsePromise;
	}
	normalizeTransportError(error) {
		const originalCode = error.code;
		if (typeof originalCode !== "string") return error;
		if (originalCode === "ETIMEDOUT" || originalCode === "ECONNABORTED" || originalCode === "ERR_SOCKET_CONNECTION_TIMEOUT" || originalCode === "UND_ERR_CONNECT_TIMEOUT" || originalCode === "UND_ERR_HEADERS_TIMEOUT" || originalCode === "UND_ERR_BODY_TIMEOUT" || /timeout|timed out/i.test(error.message)) {
			const wrapped = /* @__PURE__ */ new Error(`ACP transport timeout: ${error.message}`);
			wrapped.code = 3003;
			wrapped.data = { originalCode };
			return wrapped;
		}
		if (originalCode === "ECONNRESET" || originalCode === "ECONNREFUSED" || originalCode === "EPIPE" || originalCode === "ENOTFOUND" || originalCode === "EAI_AGAIN" || originalCode === "EAI_FAIL" || originalCode === "ENETUNREACH" || originalCode === "EHOSTUNREACH" || originalCode === "ENETDOWN" || originalCode === "EHOSTDOWN" || originalCode === "UND_ERR_SOCKET" || originalCode === "UND_ERR_CLOSED" || originalCode === "UND_ERR_ABORTED" || originalCode === "ERR_STREAM_PREMATURE_CLOSE" || /socket hang up/i.test(error.message)) {
			const wrapped = /* @__PURE__ */ new Error(`ACP transport network error: ${error.message}`);
			wrapped.code = 3002;
			wrapped.data = { originalCode };
			return wrapped;
		}
		return error;
	}
	async notify(method, params) {
		const message = {
			jsonrpc: "2.0",
			method,
			...params !== void 0 ? { params } : {}
		};
		await this.postJsonRpc(message, false);
	}
	async sendJsonRpcResult(requestId, result) {
		const message = {
			jsonrpc: "2.0",
			id: requestId,
			result
		};
		await this.postJsonRpc(message, false);
	}
	async postJsonRpc(message, expectResponse) {
		const credentials = this.requireCredentials();
		const method = "method" in message ? message.method : void 0;
		const id = "id" in message ? message.id : void 0;
		const url = new URL(this.options.endpoint);
		const isPrompt = method === "session/prompt";
		const timeoutMs = this.getPostTimeoutMs(isPrompt);
		const requestImpl = url.protocol === "https:" ? node_https.request : node_http.request;
		const body = JSON.stringify(message);
		await new Promise((resolve, reject) => {
			let settled = false;
			const settleResolve = () => {
				if (settled) return;
				settled = true;
				idleTimeout.clear();
				resolve();
			};
			const settleReject = (error) => {
				if (settled) return;
				settled = true;
				idleTimeout.clear();
				reject(error);
			};
			const req = requestImpl(url, {
				method: "POST",
				headers: {
					...this.buildAcpHeaders(credentials),
					"Content-Length": Buffer.byteLength(body).toString()
				}
			}, (res) => {
				const statusCode = res.statusCode ?? 0;
				const statusMessage = res.statusMessage ?? "";
				const contentType = String(res.headers["content-type"] ?? "");
				if (statusCode < 200 || statusCode >= 300) {
					let errorText = "";
					res.setEncoding("utf8");
					res.on("data", (chunk) => {
						idleTimeout.touch();
						this.notifyPromptTransportActivity(isPrompt, method);
						errorText += chunk;
					});
					res.on("end", () => {
						settleReject(/* @__PURE__ */ new Error(errorText ? `ACP request failed: ${statusCode} ${statusMessage} — ${errorText}` : `ACP request failed: ${statusCode} ${statusMessage}`));
					});
					res.on("error", (error) => {
						settleReject(error instanceof Error ? error : new Error(String(error)));
					});
					return;
				}
				if (!contentType.includes("text/event-stream")) {
					let jsonText = "";
					res.setEncoding("utf8");
					res.on("data", (chunk) => {
						idleTimeout.touch();
						this.notifyPromptTransportActivity(isPrompt, method);
						jsonText += chunk;
					});
					res.on("end", async () => {
						try {
							if (contentType.includes("application/json") && jsonText.trim()) await this.handleMessage(JSON.parse(jsonText));
							settleResolve();
						} catch (error) {
							settleReject(error instanceof Error ? error : new Error(String(error)));
						}
					});
					res.on("error", (error) => {
						settleReject(error instanceof Error ? error : new Error(String(error)));
					});
					return;
				}
				const parser = new SseParser();
				let sseProcessing = Promise.resolve();
				const handleSseEvents = async (events) => {
					for (const event of events) {
						if (event.event !== "message") continue;
						try {
							await this.handleMessage(JSON.parse(event.data));
						} catch {}
					}
				};
				const enqueueSseProcessing = (events) => {
					sseProcessing = sseProcessing.then(() => handleSseEvents(events), () => handleSseEvents(events));
				};
				res.setEncoding("utf8");
				res.on("data", (chunk) => {
					idleTimeout.touch();
					this.notifyPromptTransportActivity(isPrompt, method);
					enqueueSseProcessing(parser.feed(chunk));
				});
				res.on("end", async () => {
					try {
						await sseProcessing;
						await handleSseEvents(parser.flush());
						if (expectResponse && id !== void 0) {
							const pending = this.pendingRequests.get(Number(id));
							if (pending) {
								this.pendingRequests.delete(Number(id));
								const noResponseError = /* @__PURE__ */ new Error(`No response received for request: ${method ?? pending.method}`);
								this.logDiagnostic("error", "ACP request stream ended without JSON-RPC response", {
									requestId: id,
									method: method ?? pending.method,
									connectionId: credentials.connectionId,
									endpoint: this.options.endpoint,
									params: pending.paramsSummary,
									error: serializeAcpErrorForLog(noResponseError)
								});
								pending.reject(noResponseError);
							}
						}
						settleResolve();
					} catch (error) {
						settleReject(error instanceof Error ? error : new Error(String(error)));
					}
				});
				res.on("error", (error) => {
					settleReject(error instanceof Error ? error : new Error(String(error)));
				});
			});
			const idleTimeout = createIdleTimeout(timeoutMs, () => {
				req.destroy(/* @__PURE__ */ new Error(`ACP request idle timeout: ${method ?? "unknown"}`));
			});
			req.on("error", (error) => {
				settleReject(error instanceof Error ? error : new Error(String(error)));
			});
			req.write(body);
			req.end();
		});
	}
	async tryEstablishGetSse(signal) {
		const credentials = this.requireCredentials();
		try {
			const response = await fetch(this.options.endpoint, {
				method: "GET",
				headers: {
					Accept: "text/event-stream",
					"acp-connection-id": credentials.connectionId,
					...this.buildBearerHeader()
				},
				signal
			});
			if (!response.ok) return;
			await this.readSseResponse(response);
		} catch (error) {
			if (error.name === "AbortError") return;
		}
	}
	async readSseResponse(response, expectedResponseId, expectedMethod) {
		const reader = response.body?.getReader();
		if (!reader) throw new Error("Response has no readable body");
		const decoder = new TextDecoder();
		const parser = new SseParser();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const text = decoder.decode(value, { stream: true });
				for (const event of parser.feed(text)) {
					if (event.event !== "message") continue;
					try {
						const payload = JSON.parse(event.data);
						await this.handleMessage(payload);
					} catch {}
				}
			}
			for (const event of parser.flush()) {
				if (event.event !== "message") continue;
				try {
					const payload = JSON.parse(event.data);
					await this.handleMessage(payload);
				} catch {}
			}
		} finally {
			reader.releaseLock();
		}
		if (expectedResponseId !== void 0) {
			const pending = this.pendingRequests.get(Number(expectedResponseId));
			if (pending) {
				this.pendingRequests.delete(Number(expectedResponseId));
				const noResponseError = /* @__PURE__ */ new Error(`No response received for request: ${expectedMethod ?? pending.method}`);
				this.logDiagnostic("error", "ACP SSE stream ended without expected response", {
					requestId: expectedResponseId,
					method: expectedMethod ?? pending.method,
					connectionId: this.credentials?.connectionId,
					endpoint: this.options.endpoint,
					params: pending.paramsSummary,
					error: serializeAcpErrorForLog(noResponseError)
				});
				pending.reject(noResponseError);
			}
		}
	}
	async handleMessage(message) {
		if ("id" in message && !("method" in message)) {
			this.handleResponse(message);
			return;
		}
		if (!("method" in message) || typeof message.method !== "string") return;
		if ("id" in message && message.id !== void 0) {
			if (message.method === "session/request_permission" || message.method === "requestPermission") {
				await this.handlePermissionRequest(message.id, message.params ?? {});
				return;
			}
			if (message.method === "_codebuddy.ai/question") {
				await this.handleQuestionRequest(message.id, message.params ?? {});
				return;
			}
			if (message.method === "elicitation/create") {
				await this.handleElicitationRequest(message.id, message.params ?? {});
				return;
			}
			await this.sendJsonRpcResult(message.id, { outcome: { outcome: "cancelled" } });
			return;
		}
		if (message.method === "session/update" || message.method === "sessionUpdate") {
			const params = message.params;
			if (params) await this.options.onSessionUpdate?.(params);
			return;
		}
		if (message.method === "elicitation/complete") {
			const params = message.params ?? {};
			if (typeof params.elicitationId === "string") this.pendingElicitations.delete(params.elicitationId);
		}
		await this.options.onExtNotification?.(message.method, message.params ?? {});
	}
	handleResponse(message) {
		const id = Number(message.id);
		const pending = this.pendingRequests.get(id);
		if (!pending) return;
		this.pendingRequests.delete(id);
		if (message.error) {
			const error = new Error(message.error.message || `ACP request failed: ${pending.method}`);
			error.code = message.error.code;
			error.data = message.error.data;
			this.logDiagnostic("error", "ACP JSON-RPC response returned error", {
				requestId: id,
				method: pending.method,
				connectionId: this.credentials?.connectionId,
				endpoint: this.options.endpoint,
				params: pending.paramsSummary,
				error: serializeAcpErrorForLog(error)
			});
			pending.reject(error);
			return;
		}
		pending.resolve(message.result);
	}
	async handlePermissionRequest(jsonRpcId, params) {
		const toolCallId = params.toolCall?.toolCallId;
		if (!toolCallId) {
			await this.sendJsonRpcResult(jsonRpcId, { outcome: { outcome: "cancelled" } });
			return;
		}
		this.pendingPermissions.set(toolCallId, { jsonRpcId });
		await this.options.onPermissionRequest?.({
			requestId: toolCallId,
			params
		});
	}
	async handleQuestionRequest(jsonRpcId, params) {
		const toolCallId = typeof params.toolCallId === "string" ? params.toolCallId : String(jsonRpcId);
		this.pendingQuestions.set(toolCallId, { jsonRpcId });
		await this.options.onQuestionRequest?.(toolCallId, params);
	}
	/**
	* 处理 ACP 原生 elicitation/create 请求（agent 侧工具挂起期间推送的
	* 微信支付卡片等）。关联 id 优先取 _meta['codebuddy.ai'].elicitationId
	* （form 模式没有顶层 elicitationId 字段），其次取 url 模式的
	* elicitationId，最后回退 JSON-RPC id。
	*/
	async handleElicitationRequest(jsonRpcId, params) {
		const meta = params._meta?.["codebuddy.ai"];
		const elicitationId = typeof meta?.elicitationId === "string" ? meta.elicitationId : typeof params.elicitationId === "string" ? params.elicitationId : String(jsonRpcId);
		if (!this.options.onElicitationRequest) {
			await this.sendJsonRpcResult(jsonRpcId, { action: "cancel" });
			return;
		}
		this.pendingElicitations.set(elicitationId, { jsonRpcId });
		await this.options.onElicitationRequest(elicitationId, params);
	}
	/**
	* 回传 elicitation 用户操作，作为原始 elicitation/create 请求的
	* JSON-RPC response，解开 agent 侧挂起的工具调用。
	*/
	respondElicitation(elicitationId, action, content) {
		const pending = this.pendingElicitations.get(elicitationId);
		if (!pending) return false;
		this.pendingElicitations.delete(elicitationId);
		this.sendJsonRpcResult(pending.jsonRpcId, {
			action,
			...action === "accept" && content ? { content } : {}
		}).catch(() => {});
		return true;
	}
	async closeConnection(credentials) {
		try {
			await fetch(this.options.endpoint, {
				method: "DELETE",
				headers: this.buildAcpHeaders(credentials)
			});
		} catch {}
	}
	buildAcpHeaders(credentials) {
		return {
			Accept: "application/json, text/event-stream",
			"Content-Type": "application/json",
			"x-codebuddy-request": "1",
			"acp-connection-id": credentials.connectionId,
			...credentials.sessionToken ? { "acp-session-token": credentials.sessionToken } : {},
			...this.buildBearerHeader()
		};
	}
	/**
	* `/connect` 端点的请求头（尚未拿到 credentials）。
	*
	* 只带最少的头 + 可选 Bearer 兜底认证；见 `authBearer` 字段说明。
	*/
	buildConnectHeaders() {
		return {
			"x-codebuddy-request": "1",
			...this.buildBearerHeader()
		};
	}
	buildBearerHeader() {
		return this.options.authBearer ? { Authorization: `Bearer ${this.options.authBearer}` } : {};
	}
	getPostTimeoutMs(isPrompt) {
		return isPrompt ? 0 : this.options.postTimeout ?? 3e4;
	}
	notifyPromptTransportActivity(isPrompt, method) {
		if (!isPrompt) return;
		const callback = this.options.onTransportActivity;
		if (!callback) return;
		try {
			const result = callback({
				method,
				receivedAt: Date.now()
			});
			if (result instanceof Promise) result.catch(() => void 0);
		} catch {}
	}
	requireCredentials() {
		if (!this.credentials) throw new Error("ACP transport is not connected");
		return this.credentials;
	}
	rejectPendingRequests(error) {
		for (const [id, pending] of this.pendingRequests) {
			pending.reject(error);
			this.pendingRequests.delete(id);
		}
	}
	logDiagnostic(level, message, details) {
		try {
			const logger = this.options.logger;
			const detailsText = details === void 0 ? "" : ` ${safeStringifyAcpLogDetails(details)}`;
			logger?.[level]?.(`[WorkbuddyACPClient] ${message}${detailsText}`);
		} catch {}
	}
};
function summarizeAcpParamsForLog(method, params) {
	if (!params || typeof params !== "object") return;
	const record = params;
	const summary = {};
	if (typeof record.sessionId === "string") summary.sessionId = record.sessionId;
	if (method === "session/prompt") {
		const prompt = Array.isArray(record.prompt) ? record.prompt : [];
		const meta = record._meta && typeof record._meta === "object" ? record._meta : void 0;
		summary.promptItemCount = prompt.length;
		summary.promptItemTypes = prompt.slice(0, 10).map((item) => item && typeof item === "object" && typeof item.type === "string" ? item.type : typeof item);
		if (typeof record.messageId === "string") summary.messageId = record.messageId;
		if (meta) {
			summary.metaKeys = Object.keys(meta).slice(0, 20);
			if (typeof meta["codebuddy.ai/requestId"] === "string") summary.requestId = meta["codebuddy.ai/requestId"];
			if (typeof meta["codebuddy.ai/messageId"] === "string") summary.trackingMessageId = meta["codebuddy.ai/messageId"];
		}
	}
	return Object.keys(summary).length > 0 ? summary : void 0;
}
function serializeAcpErrorForLog(error) {
	if (error instanceof Error) {
		const errorWithExtras = error;
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			code: errorWithExtras.code,
			data: sanitizeAcpLogValue(errorWithExtras.data),
			cause: errorWithExtras.cause ? serializeAcpErrorCauseForLog(errorWithExtras.cause) : void 0
		};
	}
	return { message: String(error) };
}
function serializeAcpErrorCauseForLog(error) {
	if (error instanceof Error) return serializeAcpErrorForLog(error);
	return String(error);
}
function sanitizeAcpLogValue(value, depth = 0) {
	if (depth >= 3) return "[truncated]";
	if (value == null || typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
	if (Array.isArray(value)) return value.slice(0, 10).map((item) => sanitizeAcpLogValue(item, depth + 1));
	if (value instanceof Error) return serializeAcpErrorForLog(value);
	if (typeof value === "object") {
		const entries = Object.entries(value).slice(0, 20);
		return Object.fromEntries(entries.map(([key, nested]) => [key, sanitizeAcpLogValue(nested, depth + 1)]));
	}
	return String(value);
}
function safeStringifyAcpLogDetails(details) {
	if (details === null || details === void 0) return "";
	if (typeof details === "string") return details;
	try {
		return JSON.stringify(details, (_key, value) => {
			if (value instanceof Error) return serializeAcpErrorForLog(value);
			if (typeof value === "bigint") return value.toString();
			return value;
		});
	} catch {
		try {
			return String(details);
		} catch {
			return "[unserializable-acp-log-details]";
		}
	}
}
var WORKBUDDY_AGENT_ACP_CLIENT_CONNECTION_TIMEOUT_MS = 18e4;
var WORKBUDDY_AGENT_ACP_CLIENT_POST_TIMEOUT_MS = 10800 * 1e3;
function createWorkbuddyAgentAcpClient(options) {
	const client = new WorkbuddyACPClient({
		endpoint: options.endpoint,
		heartbeatTimeout: 0,
		connectionTimeout: WORKBUDDY_AGENT_ACP_CLIENT_CONNECTION_TIMEOUT_MS,
		postTimeout: WORKBUDDY_AGENT_ACP_CLIENT_POST_TIMEOUT_MS,
		logger: options.logger,
		supportsElicitation: options.supportsElicitation,
		authBearer: options.authBearer,
		onTransportActivity: options.onTransportActivity,
		onSessionUpdate: options.onSessionUpdate,
		onExtNotification: options.onExtNotification,
		onQuestionRequest: options.onQuestionRequest,
		onElicitationRequest: options.onElicitationRequest,
		onPermissionRequest: options.onPermissionRequest
	});
	const getRawConnection = () => {
		const connection = client.connection;
		if (!connection) throw new Error("[CodeBuddyACPClient] ACP connection is not initialized");
		return connection;
	};
	const wrapRequest = (getFn) => (async (...args) => {
		return getFn(getRawConnection())(...args);
	});
	const wrappedConnection = {
		newSession: wrapRequest((connection) => connection.newSession.bind(connection)),
		loadSession: wrapRequest((connection) => connection.loadSession.bind(connection)),
		resumeSession: wrapRequest((connection) => connection.resumeSession.bind(connection)),
		prompt: wrapRequest((connection) => connection.prompt.bind(connection)),
		cancel: wrapRequest((connection) => connection.cancel.bind(connection)),
		setSessionMode: wrapRequest((connection) => connection.setSessionMode.bind(connection)),
		unstable_setSessionModel: wrapRequest((connection) => connection.unstable_setSessionModel.bind(connection)),
		extMethod: wrapRequest((connection) => connection.extMethod.bind(connection))
	};
	return {
		connect: () => client.connect(),
		disconnect: () => client.disconnect(),
		get connection() {
			return wrappedConnection;
		},
		debugState: () => client.debugState(),
		resolvePermission: (requestId, optionId) => client.resolvePermission(requestId, optionId),
		rejectPermission: (requestId, reason) => client.rejectPermission(requestId, reason),
		answerQuestion: (toolCallId, answers) => client.answerQuestion(toolCallId, answers),
		cancelQuestion: (toolCallId, reason) => client.cancelQuestion(toolCallId, reason),
		respondElicitation: (elicitationId, action, content) => client.respondElicitation(elicitationId, action, content),
		resolveInterruption: (sessionId, toolCallId, decision, answers) => client.resolveInterruption(sessionId, toolCallId, decision, answers)
	};
}
var WORKBUDDY_AGENT_ALLOWED_TOOLS = [
	"present_files",
	"read_me",
	"show_widget",
	"connect_cloud_service",
	"connect_open_platform",
	"WebFetch",
	"Bash(mcporter:*)"
];
var VALID_PERMISSION_MODES$1 = new Set([
	"fullAccess",
	"plan",
	"default",
	"acceptEdits",
	"bypassPermissions"
]);
function normalizeBackendPermissionMode$1(mode) {
	if (mode && VALID_PERMISSION_MODES$1.has(mode)) return mode;
	return "bypassPermissions";
}
function shouldSuppressLegacySystemPrompt(runtimeConfig) {
	return runtimeConfig.addonManifest?.expanded.compose.cliComposeEnabled === true && runtimeConfig.addonManifest.addons.systemPrompts.some((item) => item.source === "work_mode");
}
function shouldSuppressLegacyTools(runtimeConfig) {
	return runtimeConfig.addonManifest?.expanded.compose.cliComposeEnabled === true && runtimeConfig.addonManifest.addons.tools.some((item) => item.source === "work_mode");
}
function buildAgentCliRuntimeArgs({ runtimeConfig, cwd, mcpConfig, systemPromptFile, promptVarsFile, language, envRouteMode }) {
	const args = [];
	const shouldSuppressSystemPrompt = shouldSuppressLegacySystemPrompt(runtimeConfig);
	const shouldSuppressTools = shouldSuppressLegacyTools(runtimeConfig);
	const permissionMode = normalizeBackendPermissionMode$1(runtimeConfig.permissionMode);
	args.push("--permission-mode", permissionMode);
	if (runtimeConfig.permissionModeBeforePlan) args.push("--permission-mode-before-plan", runtimeConfig.permissionModeBeforePlan);
	args.push("--allowedTools", ...WORKBUDDY_AGENT_ALLOWED_TOOLS);
	if (runtimeConfig.model) args.push("--model", runtimeConfig.model);
	if (!shouldSuppressTools && runtimeConfig.tools !== void 0) args.push("--tools", runtimeConfig.tools);
	if (!shouldSuppressSystemPrompt && systemPromptFile) args.push("--system-prompt-file", systemPromptFile);
	else if (!shouldSuppressSystemPrompt && runtimeConfig.systemPrompt) args.push("--system-prompt", runtimeConfig.systemPrompt);
	const settingsPayload = { ...runtimeConfig.sessionSettings ?? {} };
	if (cwd) settingsPayload.trustedDirectories = [`${cwd.replace(/[/\\]+$/, "") || cwd}/**`];
	if (envRouteMode) settingsPayload.envRouteMode = envRouteMode;
	if (language) settingsPayload.language = language;
	if (Object.keys(settingsPayload).length > 0) args.push("--settings", JSON.stringify(settingsPayload));
	if (mcpConfig) args.push("--mcp-config", mcpConfig, "--strict-mcp-config");
	if (promptVarsFile) args.push("--prompt-vars-file", promptVarsFile);
	return args;
}
var AGENT_CLI_LOCAL_ACP_ENDPOINT_UNAVAILABLE_CODE = "AGENT_UNAVAILABLE";
var AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE = 11109;
function createAgentCliPromptVarsRestoreFailedError(message, data) {
	const error = new Error(message);
	error.code = AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE;
	error.data = {
		reason: data.reason,
		sessionId: data.sessionId,
		...data.causeCode ? { causeCode: data.causeCode } : {}
	};
	return error;
}
function writeAgentCliSystemPromptFile(sessionId, systemPrompt) {
	if (!systemPrompt) return null;
	const tmpDir = node_path.join(node_os.tmpdir(), "workbuddy-prompts");
	node_fs.mkdirSync(tmpDir, { recursive: true });
	const filePath = node_path.join(tmpDir, `${sessionId}.prompt.txt`);
	node_fs.writeFileSync(filePath, systemPrompt, "utf-8");
	return filePath;
}
function getAgentCliPromptVarsFilePath(sessionId) {
	return node_path.join(node_os.tmpdir(), "workbuddy-prompt-vars", `${sessionId}.prompt-vars.json`);
}
function writeAgentCliPromptVarsFile(sessionId, variables) {
	if (!variables || Object.keys(variables).length === 0) return null;
	const filePath = getAgentCliPromptVarsFilePath(sessionId);
	node_fs.mkdirSync(node_path.dirname(filePath), { recursive: true });
	node_fs.writeFileSync(filePath, JSON.stringify({
		version: 1,
		variables
	}), "utf-8");
	return filePath;
}
function ensureAgentCliPromptVarsFile(sessionId, expectedFilePath, variables) {
	if (!variables || Object.keys(variables).length === 0) return {
		status: "not_required",
		filePath: null
	};
	const canonicalPath = getAgentCliPromptVarsFilePath(sessionId);
	const targetPath = expectedFilePath ?? canonicalPath;
	if (targetPath !== canonicalPath) throw createAgentCliPromptVarsRestoreFailedError(`Refusing to restore prompt-vars file outside canonical path for session ${sessionId}`, {
		sessionId,
		reason: "path_mismatch"
	});
	const health = inspectAgentCliPromptVarsFile(targetPath, variables);
	if (health.healthy) return {
		status: "healthy",
		filePath: targetPath
	};
	let written;
	try {
		written = writeAgentCliPromptVarsFile(sessionId, variables);
	} catch (error) {
		const causeCode = error.code;
		throw createAgentCliPromptVarsRestoreFailedError(`Failed to restore prompt-vars file for session ${sessionId}`, {
			sessionId,
			reason: health.reason === "not_file" ? "not_file" : "write_failed",
			...typeof causeCode === "string" ? { causeCode } : {}
		});
	}
	if (!written || written !== canonicalPath) throw createAgentCliPromptVarsRestoreFailedError(`Failed to restore prompt-vars file for session ${sessionId}`, {
		sessionId,
		reason: "write_failed"
	});
	const restoredHealth = inspectAgentCliPromptVarsFile(written, variables);
	if (!restoredHealth.healthy) throw createAgentCliPromptVarsRestoreFailedError(`Prompt-vars file still unhealthy after restore for session ${sessionId} (${restoredHealth.reason})`, {
		sessionId,
		reason: "still_unhealthy"
	});
	return {
		status: "restored",
		filePath: written,
		reason: health.reason
	};
}
function inspectAgentCliPromptVarsFile(filePath, variables) {
	let stat;
	try {
		stat = node_fs.statSync(filePath);
	} catch (error) {
		if (error.code === "ENOENT") return {
			healthy: false,
			reason: "missing"
		};
		return {
			healthy: false,
			reason: "unreadable"
		};
	}
	if (!stat.isFile()) return {
		healthy: false,
		reason: "not_file"
	};
	let raw;
	try {
		raw = node_fs.readFileSync(filePath, "utf-8");
	} catch {
		return {
			healthy: false,
			reason: "unreadable"
		};
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {
			healthy: false,
			reason: "invalid_json"
		};
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {
		healthy: false,
		reason: "invalid_payload"
	};
	const payload = parsed;
	if (payload.version !== 1) return {
		healthy: false,
		reason: "invalid_payload"
	};
	if (!payload.variables || typeof payload.variables !== "object" || Array.isArray(payload.variables)) return {
		healthy: false,
		reason: "invalid_payload"
	};
	if (!areAgentCliPromptVariablesEqual(variables, payload.variables)) return {
		healthy: false,
		reason: "content_mismatch"
	};
	return { healthy: true };
}
function areAgentCliPromptVariablesEqual(expected, actual) {
	const expectedKeys = Object.keys(expected);
	const actualKeys = Object.keys(actual);
	if (expectedKeys.length !== actualKeys.length) return false;
	for (const key of expectedKeys) if (actual[key] !== expected[key]) return false;
	return true;
}
function cleanupAgentCliTempFile(filePath) {
	if (!filePath) return;
	try {
		node_fs.unlinkSync(filePath);
	} catch {}
}
function cleanupAgentCliSystemPromptFile(filePath) {
	cleanupAgentCliTempFile(filePath);
}
function cleanupAgentCliPromptVarsFile(filePath) {
	cleanupAgentCliTempFile(filePath);
}
async function waitForAgentCliLocalAcpEndpoint(acpEndpoint, options = {}) {
	const match = acpEndpoint.match(/:(\d+)/);
	if (!match) return;
	const timeoutMs = options.timeoutMs ?? 18e4;
	const pollIntervalMs = options.pollIntervalMs ?? 100;
	const logPrefix = options.logPrefix ?? "[CodeBuddyCodeBackend]";
	const port = parseInt(match[1], 10);
	const host = "127.0.0.1";
	const deadline = Date.now() + timeoutMs;
	let attempts = 0;
	const startTime = Date.now();
	let lastErr;
	options.logger?.info?.(`${logPrefix} waitForPort: starting, endpoint=${acpEndpoint}, port=${port}, timeoutMs=${timeoutMs}`);
	while (Date.now() < deadline) {
		attempts++;
		if (await new Promise((resolve) => {
			const socket = (0, node_net.createConnection)({
				host,
				port
			}, () => {
				socket.destroy();
				resolve(true);
			});
			socket.on("error", (err) => {
				lastErr = err.code ?? err.message;
				socket.destroy();
				resolve(false);
			});
		})) {
			options.logger?.info?.(`${logPrefix} waitForPort: SUCCESS, port=${port}, attempts=${attempts}, elapsed=${Date.now() - startTime}ms`);
			return;
		}
		if (attempts % 100 === 0) options.logger?.warn?.(`${logPrefix} waitForPort: still waiting, port=${port}, attempts=${attempts}, elapsed=${Date.now() - startTime}ms, remaining=${deadline - Date.now()}ms, lastErr=${lastErr ?? "none"}`);
		await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
	}
	const elapsedMs = Date.now() - startTime;
	options.logger?.error?.(`${logPrefix} waitForPort: TIMEOUT, port=${port}, attempts=${attempts}, elapsed=${elapsedMs}ms, lastErr=${lastErr ?? "none"}`);
	throw createAgentCliLocalAcpEndpointUnavailableError(acpEndpoint, timeoutMs, attempts, elapsedMs, logPrefix);
}
function createAgentCliLocalAcpEndpointUnavailableError(endpoint, timeoutMs, attempts, elapsedMs, logPrefix = "[CodeBuddyCodeBackend]") {
	const error = /* @__PURE__ */ new Error(`${logPrefix} Local ACP endpoint ${endpoint} not reachable after ${timeoutMs}ms`);
	error.code = AGENT_CLI_LOCAL_ACP_ENDPOINT_UNAVAILABLE_CODE;
	error.data = {
		endpoint,
		timeoutMs,
		attempts,
		elapsedMs
	};
	return error;
}
function resolveCliSettingsLanguage(deps = {}) {
	let configuredLocale;
	try {
		const raw = deps.readAppConfigValue?.("locale");
		if (typeof raw === "string" && raw.trim()) configuredLocale = raw.trim();
	} catch {}
	let systemLocale = "";
	try {
		systemLocale = deps.getSystemLocale?.() || "";
	} catch {
		systemLocale = "";
	}
	if (!configuredLocale && !systemLocale) return;
	return require_workbuddy_auth_product_coordinator.resolveResponseLocaleIsZh(configuredLocale, systemLocale) ? "简体中文" : "English";
}
var MAX_CACHE_SIZE = 1e3;
var MAX_PARAM_LEN = 200;
var META_TOOL_NAME = "codebuddy.ai/toolName";
var META_PERMISSION_RESOLVED = "codebuddy.ai/permissionResolved";
var META_TOOL_CALL_ID = "codebuddy.ai/toolCallId";
var META_DECISION = "codebuddy.ai/decision";
var TOOL_BASH = "Bash";
var TOOL_WEB_FETCH = "WebFetch";
var MCP_TOOL_PREFIX = "mcp__";
var TOOL_AUDIT_RULES = {
	[TOOL_BASH]: {
		extractParams: (rawInput) => ({ command: truncateUtf16(String(rawInput.command ?? ""), MAX_PARAM_LEN) }),
		keys: {
			approved: {
				category: "approval",
				key: "securityCenter.audit.approval.commandApproved"
			},
			rejected: {
				category: "rejection",
				key: "securityCenter.audit.rejection.commandRejected"
			}
		}
	},
	[TOOL_WEB_FETCH]: {
		extractParams: (rawInput, errorMessage) => ({
			target: String(rawInput.url ?? ""),
			...errorMessage ? { reason: truncateUtf16(errorMessage, MAX_PARAM_LEN) } : {}
		}),
		keys: {
			allowed: {
				category: "network",
				key: "securityCenter.audit.network.success"
			},
			failed: {
				category: "network",
				key: "securityCenter.audit.network.failed"
			}
		}
	}
};
var MCP_AUDIT_KEYS = {
	allowed: {
		category: "mcp",
		key: "securityCenter.audit.mcp.executed"
	},
	failed: {
		category: "mcp",
		key: "securityCenter.audit.mcp.failed"
	}
};
function createAuditAcpAdapter(deps) {
	const { store, logger, now = () => Date.now() } = deps;
	const cache = /* @__PURE__ */ new Map();
	function rememberInput(toolCallId, info) {
		if (cache.size >= MAX_CACHE_SIZE && !cache.has(toolCallId)) {
			const oldest = cache.keys().next().value;
			if (oldest !== void 0) cache.delete(oldest);
		}
		cache.delete(toolCallId);
		cache.set(toolCallId, info);
	}
	return { async consume(notification) {
		try {
			const root = notification;
			const update = root?.update;
			const sessionUpdate = update?.sessionUpdate;
			if (sessionUpdate !== "tool_call" && sessionUpdate !== "tool_call_update" && sessionUpdate !== "session_info_update") return;
			if (sessionUpdate === "session_info_update") {
				const meta = readCodeBuddyMeta(root?._meta, update?._meta);
				if (!meta || meta[META_PERMISSION_RESOLVED] !== true) return;
				const toolCallId = readString(meta[META_TOOL_CALL_ID]);
				const toolName = readString(meta[META_TOOL_NAME]);
				const rawDecision = readString(meta[META_DECISION]);
				if (!toolCallId || !toolName || !rawDecision) return;
				const rule = TOOL_AUDIT_RULES[toolName];
				const decision = mapPermissionDecision(rawDecision);
				if (!rule || !decision) return;
				const keyEntry = rule.keys[decision];
				if (!keyEntry) {
					cache.delete(toolCallId);
					return;
				}
				const cached = cache.get(toolCallId);
				const rawInput = cached?.rawInput ?? {};
				if (toolName === TOOL_BASH && !hasNonEmptyString(rawInput.command)) {
					cache.delete(toolCallId);
					return;
				}
				await store.append({
					source: "desktop-main",
					category: keyEntry.category,
					eventType: toolName,
					messageKey: keyEntry.key,
					messageParams: rule.extractParams(rawInput),
					decision: toAuditDecision(decision),
					timestamp: now(),
					sessionId: cached?.sessionId ?? root?.sessionId,
					toolCallId,
					commandHash: computeForensicHash(toolName, rawInput)
				});
				cache.delete(toolCallId);
				return;
			}
			const toolCallId = update?.toolCallId;
			if (!toolCallId) return;
			const meta = readCodeBuddyMeta(root?._meta, update?._meta);
			const toolName = meta ? readString(meta[META_TOOL_NAME]) : void 0;
			if (sessionUpdate === "tool_call") {
				if (!toolName || !isAuditedToolName(toolName)) return;
				rememberInput(toolCallId, {
					toolName,
					rawInput: update.rawInput ?? {},
					sessionId: root?.sessionId
				});
				return;
			}
			const cached = cache.get(toolCallId);
			if (!cached || cached.toolName === TOOL_BASH) return;
			const decision = mapToolUpdateStatus(update?.status);
			if (!decision) return;
			const errorMessage = decision === "failed" ? extractErrorMessage(update?.rawOutput) : void 0;
			const entry = cached.toolName.startsWith(MCP_TOOL_PREFIX) ? buildMcpEntry(toolCallId, cached, decision, errorMessage, root?.sessionId, now()) : buildNamedToolEntry(toolCallId, cached, decision, errorMessage, root?.sessionId, now());
			if (entry) await store.append(entry);
			cache.delete(toolCallId);
		} catch (error) {
			logger.warn(`[audit-acp-adapter] consume failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	} };
}
function isAuditedToolName(toolName) {
	return toolName === TOOL_BASH || toolName === TOOL_WEB_FETCH || toolName.startsWith(MCP_TOOL_PREFIX);
}
function buildNamedToolEntry(toolCallId, cached, decision, errorMessage, rootSessionId, timestamp) {
	const rule = TOOL_AUDIT_RULES[cached.toolName];
	if (!rule) return;
	const keyEntry = cached.toolName === TOOL_WEB_FETCH && decision === "failed" && errorMessage ? {
		category: "network",
		key: "securityCenter.audit.network.failedWithReason"
	} : rule.keys[decision];
	if (!keyEntry) return;
	return {
		source: "desktop-main",
		category: keyEntry.category,
		eventType: cached.toolName,
		messageKey: keyEntry.key,
		messageParams: rule.extractParams(cached.rawInput, errorMessage),
		decision: toAuditDecision(decision),
		timestamp,
		sessionId: cached.sessionId ?? rootSessionId,
		toolCallId,
		commandHash: computeForensicHash(cached.toolName, cached.rawInput)
	};
}
function buildMcpEntry(toolCallId, cached, decision, errorMessage, rootSessionId, timestamp) {
	const keyEntry = MCP_AUDIT_KEYS[decision];
	const rest = cached.toolName.slice(5);
	const sepIdx = rest.indexOf("__");
	const serverName = sepIdx > 0 ? rest.slice(0, sepIdx) : rest;
	const innerToolName = sepIdx > 0 ? rest.slice(sepIdx + 2) : "";
	return {
		source: "desktop-main",
		category: keyEntry.category,
		eventType: cached.toolName,
		messageKey: keyEntry.key,
		messageParams: {
			serverName,
			toolName: innerToolName,
			...errorMessage ? { reason: truncateUtf16(errorMessage, MAX_PARAM_LEN) } : {}
		},
		decision: toAuditDecision(decision),
		timestamp,
		sessionId: cached.sessionId ?? rootSessionId,
		toolCallId,
		commandHash: computeForensicHash(cached.toolName, cached.rawInput)
	};
}
function computeForensicHash(toolName, rawInput) {
	if (toolName === TOOL_BASH) {
		const command = String(rawInput.command ?? "");
		return command ? commandHash(command) : void 0;
	}
	return sha256Hex(`${toolName}\n${stableStringify(rawInput)}`);
}
function readMeta(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function readCodeBuddyMeta(rootMeta, updateMeta) {
	const merged = {};
	const mergeOne = (meta) => {
		if (!meta) return;
		const nested = readMeta(meta["codebuddy.ai"]);
		if (nested) for (const [key, value] of Object.entries(nested)) merged[`codebuddy.ai/${key}`] = value;
		for (const [key, value] of Object.entries(meta)) if (key !== "codebuddy.ai") merged[key] = value;
	};
	mergeOne(readMeta(rootMeta));
	mergeOne(readMeta(updateMeta));
	return Object.keys(merged).length > 0 ? merged : void 0;
}
function readString(value) {
	return typeof value === "string" ? value : void 0;
}
function hasNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}
function mapToolUpdateStatus(status) {
	if (status === "completed") return "allowed";
	if (status === "failed") return "failed";
}
function mapPermissionDecision(decision) {
	if (decision === "allow" || decision === "allowAll") return "approved";
	if (decision === "deny" || decision === "rejectAndExitPlan") return "rejected";
}
function toAuditDecision(decision) {
	return decision === "allowed" || decision === "failed" ? decision : decision === "approved" ? "approved" : "rejected";
}
function extractErrorMessage(rawOutput) {
	if (!rawOutput) return;
	const candidate = rawOutput.errorMessage ?? rawOutput.message ?? rawOutput.error;
	return typeof candidate === "string" && candidate.length > 0 ? candidate : void 0;
}
function truncateUtf16(value, max) {
	return value.length > max ? value.slice(0, max) : value;
}
function isTransientDisconnectMessage(message) {
	return message === "disconnected" || message === "WorkBuddy daemon client disconnected" || /: not connected \(state=(?:connecting|reconnecting|disconnected)\)$/i.test(message) || /: connection lost \(/i.test(message) || /^ACP transport is not connected$/i.test(message);
}
var SANDBOX_DISABLED_REASON_META_KEY = "codebuddy.ai/sandboxDisabledReason";
var TAG = "[CodeBuddyCodeBackend]";
var ACP_ENDPOINT_WAIT_TIMEOUT_MS = 18e4;
var ACP_CONNECT_TIMEOUT_MS = process.platform === "win32" ? 45e3 : 6e4;
var ACP_CONNECT_RETRY_DELAY_MS = process.platform === "win32" ? 200 : 500;
var USE_SYSTEM_CA_NODE_OPTION$1 = "--use-system-ca";
var CODEBUDDY_QIMEI36_ENV_KEY = "CODEBUDDY_QIMEI36";
function isClawWorkspaceCwd(cwd) {
	const trimmed = cwd?.trim();
	if (!trimmed) return false;
	try {
		return path.resolve(trimmed).toLowerCase() === path.resolve(resolveClawCwd()).toLowerCase();
	} catch {
		return false;
	}
}
var VALID_PERMISSION_MODES = new Set([
	"fullAccess",
	"plan",
	"default",
	"acceptEdits",
	"bypassPermissions"
]);
function normalizeBackendPermissionMode(mode) {
	if (mode && VALID_PERMISSION_MODES.has(mode)) return mode;
	return "bypassPermissions";
}
var sidecarLog = console;
function isProductionBuildLayout(appPath, isPackaged) {
	if (isPackaged) return true;
	try {
		const parentDir = path.basename(path.dirname(appPath));
		return parentDir === "Resources" || parentDir === "resources";
	} catch {
		return false;
	}
}
function defaultResolveBundledAsset() {}
function defaultRequireBundledAsset(...segments) {
	return path.join(process.cwd(), ...segments);
}
function defaultGetBootstrapProductConfigEnv() {
	return "{}";
}
function getProxyEnvFromProcess$1() {
	const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
	const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
	const env = {};
	if (httpProxy) env.HTTP_PROXY = httpProxy;
	if (httpsProxy) env.HTTPS_PROXY = httpsProxy;
	if (httpProxy || httpsProxy) {
		env.NO_PROXY = require_proxy_env.mergeNoProxy(process.env.NO_PROXY || process.env.no_proxy);
		env.NODE_OPTIONS = USE_SYSTEM_CA_NODE_OPTION$1;
	}
	return env;
}
async function defaultResolveProxyEnv() {
	return getProxyEnvFromProcess$1();
}
function shouldUseServeMode(dependencies = {}) {
	if (process.platform !== "darwin") return true;
	return (dependencies.isProductionBuildLayout ?? isProductionBuildLayout)(dependencies.getAppPath?.() ?? process.cwd(), dependencies.isAppPackaged?.() ?? false);
}
function isValidHex32(value) {
	return typeof value === "string" && /^[0-9a-f]{32}$/.test(value) && value !== "0".repeat(32);
}
function readIsBackgroundAutomationMeta(rawMeta) {
	if (!rawMeta || typeof rawMeta !== "object") return false;
	const cb = rawMeta["codebuddy.ai"];
	if (!cb || typeof cb !== "object") return false;
	return cb.isBackgroundAutomation === true;
}
function extractCodeBuddyPromptTraceMeta(rawMeta) {
	if (!rawMeta || typeof rawMeta !== "object") return;
	const cb = rawMeta["codebuddy.ai"];
	if (!cb || typeof cb !== "object") return;
	const cbMeta = cb;
	const promptRequestId = cbMeta.promptRequestId;
	if (!isValidHex32(promptRequestId)) return;
	return {
		promptRequestId,
		conversationId: typeof cbMeta.conversationId === "string" ? cbMeta.conversationId : "",
		userId: typeof cbMeta.userId === "string" ? cbMeta.userId : "",
		clientSendTime: typeof cbMeta.clientSendTime === "number" ? cbMeta.clientSendTime : 0,
		traceId: isValidHex32(cbMeta.traceId) ? cbMeta.traceId : void 0
	};
}
function extractCliTraceId(rawMeta) {
	if (!rawMeta || typeof rawMeta !== "object") return;
	const meta = rawMeta;
	const flat = meta["codebuddy.ai/traceId"];
	if (isValidHex32(flat)) return flat;
	const cb = meta["codebuddy.ai"];
	if (cb && typeof cb === "object") {
		const nested = cb.traceId;
		if (isValidHex32(nested)) return nested;
	}
}
function extractCliOutcome(rawMeta) {
	if (!rawMeta || typeof rawMeta !== "object") return;
	const outcome = rawMeta["codebuddy.ai/outcome"];
	return typeof outcome === "string" && outcome ? outcome : void 0;
}
function extractCliTraceIdFromError(error) {
	if (!error || typeof error !== "object") return;
	const err = error;
	return extractCliTraceId(err._meta) ?? extractCliTraceId(err.data?._meta);
}
var CodeBuddyCodeBackend = class {
	id = "codebuddy-code";
	name = "CodeBuddy Code";
	capabilities = {
		supportsPTY: true,
		supportsStreaming: true,
		supportsMCP: true
	};
	/**
	* Active per-chat session backends created via `create()`.
	*
	* Tracked so that global events (e.g. auth owner change) can soft-reset
	* every live ACP client — without this set, only the shared sidecar
	* `host` runtime is torn down on logout/switch, leaving each chat's
	* `WorkbuddyACPClient` holding stale `connectionId`/`sessionToken`
	* credentials and producing "transport failed" / "not connected" errors
	* on the next user prompt. See issue #32662 / #32280.
	*/
	activeSessions = /* @__PURE__ */ new Set();
	/**
	* In-flight transport-detach promises for orphan backends evicted by
	* `create()`. Exposed via `awaitOrphanCleanup()` so tests can await the
	* old ACP client disconnect without changing the synchronous `create()`
	* signature.
	*/
	orphanCleanupPromises = /* @__PURE__ */ new Set();
	constructor(runtimeManager, dependencies = {}) {
		this.runtimeManager = runtimeManager;
		this.dependencies = dependencies;
	}
	create(params) {
		const orphans = [];
		for (const existing of this.activeSessions) if (existing.debugSessionId === params.sessionId) orphans.push(existing);
		if (orphans.length > 0) {
			this.dependencies.logger?.warn?.(`${TAG} create() found ${orphans.length} orphan backend(s) for sessionId="${params.sessionId}"; tearing them down before registering a new instance`);
			for (const orphan of orphans) {
				this.activeSessions.delete(orphan);
				const cleanup = orphan.detachOrphanClient("duplicate-session-backend").catch((error) => {
					this.dependencies.logger?.warn?.(`${TAG} create() orphan client detach failed for sessionId="${params.sessionId}"`, { error: error instanceof Error ? error.message : String(error) });
				});
				this.orphanCleanupPromises.add(cleanup);
				cleanup.finally(() => {
					this.orphanCleanupPromises.delete(cleanup);
				});
			}
		}
		const session = new CodeBuddyCodeSessionBackend({
			definition: this,
			runtimeManager: this.runtimeManager,
			dependencies: this.dependencies,
			params,
			onDisposed: (self) => {
				this.activeSessions.delete(self);
				this.dependencies.logger?.info?.(`${TAG} create() onDisposed removed session "${self.debugSessionId}" from activeSessions; remaining=${this.activeSessions.size}`);
			}
		});
		this.activeSessions.add(session);
		this.dependencies.logger?.info?.(`${TAG} create() registered session "${params.sessionId}" in activeSessions; total=${this.activeSessions.size}`);
		return session;
	}
	/**
	* Resolve once every orphan-backend ACP-client detach triggered by
	* `create()` has settled. Useful for tests that need to be sure the
	* previous SSE subscription is gone.
	*
	* Always best-effort: rejected detaches are swallowed in `create()`
	* so this never throws.
	*/
	async awaitOrphanCleanup() {
		if (this.orphanCleanupPromises.size === 0) return;
		await Promise.all([...this.orphanCleanupPromises]);
	}
	/**
	* Tear down the ACP client of every active per-chat backend so the next
	* prompt re-runs `initializeInternal()` and establishes a fresh
	* `/connect` handshake (new connectionId + sessionToken).
	*
	* Called on auth owner change (see bindHostedCliAuthLifecycle). The
	* session objects themselves are kept alive — only their transport
	* state is discarded. Idempotent and best-effort: failures are logged
	* and swallowed so one bad session does not block the rest.
	*/
	async resetActiveSessions(reason) {
		const sessions = [...this.activeSessions];
		if (sessions.length === 0) {
			this.dependencies.logger?.info?.(`${TAG} resetActiveSessions called but activeSessions is empty; reason=${reason}`);
			return;
		}
		this.dependencies.logger?.info?.(`${TAG} resetActiveSessions triggering softReset on ${sessions.length} session(s); reason=${reason}; sessionIds=${sessions.map((s) => s.debugSessionId).join(",")}`);
		await Promise.all(sessions.map(async (session) => {
			try {
				await session.softReset(reason);
			} catch (error) {
				this.dependencies.logger?.warn?.(`${TAG} softReset failed for session "${session.debugSessionId}"`, {
					reason,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		}));
	}
	async dispose() {
		await Promise.resolve();
	}
};
var CodeBuddyCodeSessionBackend = class {
	id;
	name;
	capabilities;
	onSessionUpdate = null;
	onPermissionRequest = null;
	onQuestionRequest = null;
	onElicitationRequest = null;
	onRuntimeSignal = null;
	onTransportActivity = null;
	onExtNotification = null;
	auditAdapter;
	sessionId;
	cwd;
	env;
	/**
	* 本会话是否为后台自动化任务（定时任务 / automation run）。
	*
	* 来自 `CreateAgentBackendParams._meta['codebuddy.ai'].isBackgroundAutomation`，
	* 由 automation-service 创建 session 时写入。true 时 `acquireRuntime`
	* 跳过 prewarm 池、强制冷启动：预热池是为交互式会话的秒开体验准备的稀缺
	* 资源，后台自动化任务对启动延迟不敏感，不应抢占预热进程，否则会拖慢真正
	* 需要秒开的用户交互会话。
	*/
	isBackgroundAutomation;
	dependencies;
	onDisposed;
	/**
	* 上次 spawn agent-cli 子进程时注入的 `CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS` 值。
	*
	* 用于在 `reconfigure` 时检测"专家团切换导致的 env 漂移"：
	* - 子进程的 env 在 spawn 后无法热更新，必须重启 backend 才能改 team 工具可用性。
	* - 选专家团（expertType='team'）通常通过 plugin hot-switch（不重启 sidecar）触达，
	*   此时如果不主动报告 `restart_required`，team 工具永远拿不到。
	*/
	lastAppliedAgentTeamsEnv = void 0;
	initializeRequest = null;
	initializePromise = null;
	/**
	* 单调递增的 prompt 计数。每次外层 `prompt()` 进入时自增。
	*
	* `cancel()` 进入时快照此值；若在 `cancel()` 等待 backend 就绪期间有新的
	* prompt 进来（计数变化），说明这次 cancel 想取消的那一轮已经被新 prompt
	* 取代，发送 `session/cancel` 只会误伤新 prompt，因此直接跳过。
	*/
	promptSeq = 0;
	client = null;
	acpEndpoint = null;
	runtimeStarted = false;
	/**
	* 一次性生命周期标志：`initializeInternal` 成功建立 runtime 后置 true；
	* 只在 `killRuntimeSession()` 真正跑完（也即 runtime 已被回收）时才清零。
	*
	* 与 `runtimeStarted` 的差异（issue #75458 的根因）：
	* - `runtimeStarted` 表示"当前 backend **正持有** runtime 的 transport 所有权"，
	*   `detachOrphanClient()` 会主动置 false 把所有权让给同 sessionId 的新 backend
	*   （restart / 二次 create 场景，让新 backend 复用同一 runtime，避免 SSE 重复
	*   订阅）。
	* - `runtimeEverStarted` 表示"这个 backend 曾经把 runtime 起起来过"，是一次性
	*   历史事实——`detachOrphanClient()` **不动**它。这样 `destroy()` 能兜住
	*   "冷启动 + detachOrphanClient 但未走 restart releaseRuntime"这种孤儿路径：
	*   restart 流水的 `releaseRuntime()` 会先跑并清零该标志，destroy 幂等短路；
	*   而"切 Tab + 删会话"等场景没有 releaseRuntime 兜底，destroy 就据此触发一次
	*   兜底 kill，防止冷启动 sidecar 进程 / ACP 端口永久泄漏（#75458 现象：
	*   `--serve` 冷启动进程存活 > 2h，janitor 无从回收）。
	*
	* 语义总结：`runtimeStarted` 是"所有权"，`runtimeEverStarted` 是"责任"。
	*/
	runtimeEverStarted = false;
	/**
	* 当本会话当前运行在一个 prewarm 池产生的进程上时为 true。
	*
	* killSession 路径据此分叉：true → 让 pool 按 pid 终止；false → 走原
	* runtimeManager.killSession（sidecar 路径）。
	*
	* 在 initializeInternal 命中 prewarm 时置 true；reconfigure 重启会先 kill
	* 再 init，置位/复位时机与 runtimeStarted 一一对应——killRuntimeSession 内
	* 会同步清掉这个标志，避免下次 init 误判。
	*/
	prewarmActivated = false;
	destroyed = false;
	/** Bumped by softReset() to invalidate any in-flight initializeInternal. */
	resetEpoch = 0;
	runtimeConfig;
	systemPromptFile = null;
	promptVarsFile = null;
	/** Last waitForPort duration (ms), captured in connectClient for timing breakdown */
	_lastWaitForPortMs;
	/**
	* Last value pushed per session config option (sandbox, thought_level, …).
	* Cached so that after a {@link softReset} (account switch) or self-healing
	* reconnect via {@link ensureInitialized} — both of which spawn a fresh CLI
	* sidecar that starts with default config — `initializeInternal` can replay
	* the user's intent without going through `SessionManager`. This cache is
	* also what makes swallowing transient disconnects in
	* {@link applySessionConfigOption} safe: the value is re-applied on the
	* next reconnect instead of being silently lost.
	*
	* An absent key means "user never set this option on this backend
	* instance" — keep CLI default behavior, don't push anything.
	*/
	lastSessionConfigOptions = /* @__PURE__ */ new Map();
	/** Sandbox 关闭来源只随 sandbox 配置重放，不改变其他配置项的缓存结构。 */
	lastSandboxDisabledReason;
	constructor(args) {
		this.id = args.definition.id;
		this.name = args.definition.name;
		this.capabilities = args.definition.capabilities;
		this.runtimeManager = args.runtimeManager;
		this.dependencies = args.dependencies;
		this.sessionId = args.params.sessionId;
		this.cwd = args.params.cwd;
		sidecarLog.info(`[CodeBuddyCodeBackend] constructor: sessionId=${this.sessionId} cwd=${this.cwd} isClaw=${isClawWorkspaceCwd(this.cwd)}`);
		this.env = args.params.env;
		this.isBackgroundAutomation = readIsBackgroundAutomationMeta(args.params._meta);
		this.runtimeConfig = normalizeRuntimeConfig(args.params.runtimeConfig);
		this.onDisposed = args.onDisposed;
		this.auditAdapter = args.dependencies.auditStore ? createAuditAcpAdapter({
			store: args.dependencies.auditStore,
			logger: { warn: (message) => args.dependencies.logger?.warn?.(message) }
		}) : void 0;
	}
	/** Exposed for `CodeBuddyCodeBackend.resetActiveSessions` logging. */
	get debugSessionId() {
		return this.sessionId;
	}
	runtimeManager;
	async initialize(request) {
		this.initializeRequest = request;
		const wasDestroyed = this.destroyed;
		this.destroyed = false;
		if (this.client) return { sessionId: this.sessionId };
		if (this.initializePromise) {
			this.logDiagnostic("info", "initialize() joining in-flight initializePromise", {
				sessionId: this.sessionId,
				kind: request.kind
			});
			return this.initializePromise;
		}
		this.logDiagnostic("info", "initialize() starting", {
			sessionId: this.sessionId,
			kind: request.kind,
			wasDestroyed
		});
		const promise = this.initializeInternal(request);
		this.initializePromise = promise;
		try {
			const result = await promise;
			this.logDiagnostic("info", "initialize() succeeded", {
				sessionId: this.sessionId,
				endpoint: this.acpEndpoint
			});
			return result;
		} finally {
			if (this.initializePromise === promise) this.initializePromise = null;
		}
	}
	async initializeInternal(request) {
		const myEpoch = this.resetEpoch;
		if (this.client) return { sessionId: this.sessionId };
		if ((request.kind === "load" || request.kind === "resume") && request.request.sessionId !== this.sessionId) throw new Error(`${TAG} ${request.kind} initialize expected session "${this.sessionId}", got "${request.request.sessionId}"`);
		const t0 = performance.now();
		let tMark = t0;
		const port = 0;
		const findPortMs = 0;
		sidecarLog.info(`[CodeBuddyCodeBackend] initializeInternal: sessionId=${this.sessionId}, kind=${request.kind}, port=auto, findPortMs=0ms`);
		tMark = performance.now();
		const cliPath = (this.dependencies.resolveCliPath ?? (() => resolveCLIPath(this.dependencies)))();
		const connectorTokenEnv = this.dependencies.getConnectorTokenEnv?.() ?? {};
		const explicitAgentTeamsEnv = this.env?.[require_cli_prewarm_pool.AGENT_TEAMS_ENV_KEY];
		const agentTeamsEnvValue = explicitAgentTeamsEnv === "0" || explicitAgentTeamsEnv === "1" ? explicitAgentTeamsEnv : this.dependencies.getAgentTeamsEnv?.(this.sessionId);
		const agentTeamsEnv = agentTeamsEnvValue ? { [require_cli_prewarm_pool.AGENT_TEAMS_ENV_KEY]: agentTeamsEnvValue } : {};
		this.lastAppliedAgentTeamsEnv = agentTeamsEnvValue;
		const defaultBuildEnv = (extra) => buildEnv(extra, {
			getAppVersion: this.dependencies.getAppVersion,
			getConfigDir: this.dependencies.getConfigDir,
			getUserDataDir: this.dependencies.getUserDataDir,
			resolveBundledAsset: this.dependencies.resolveBundledAsset,
			requireBundledAsset: this.dependencies.requireBundledAsset,
			getBootstrapProductConfigEnv: this.dependencies.getBootstrapProductConfigEnv,
			getProcessProxyEnv: this.dependencies.getProcessProxyEnv,
			resolveDefaultConfigDirname: this.dependencies.resolveDefaultConfigDirname
		});
		const projectSessionExtra = this.dependencies.getProjectSessionEnv?.(this.sessionId) ?? {};
		const qimei36 = (await this.dependencies.getQimei36?.())?.trim();
		const qimeiEnv = qimei36 ? { [CODEBUDDY_QIMEI36_ENV_KEY]: qimei36 } : {};
		const env = {
			...(this.dependencies.buildEnv ?? defaultBuildEnv)({
				...this.env,
				...connectorTokenEnv,
				...projectSessionExtra,
				...qimeiEnv
			}),
			...await (this.dependencies.resolveProxyEnv ?? defaultResolveProxyEnv)(),
			...agentTeamsEnv
		};
		sidecarLog.info(`[CodeBuddyCodeBackend] initializeInternal: agent-teams env value=${agentTeamsEnvValue ?? "(not set)"} sessionId=${this.sessionId}`);
		const electronPath = this.dependencies.processExecPath ?? process.execPath;
		sidecarLog.info(`[CodeBuddyCodeBackend] initializeInternal: cliPath=${cliPath}, electronPath=${electronPath}`);
		let mcpConfig = this.dependencies.getMcpConfig?.({ projectId: this.env?.["CODEBUDDY_PROJECT_ID"] });
		const projectMcpServers = this.dependencies.getProjectMcpServersForSession?.(this.sessionId);
		if (projectMcpServers) try {
			const parsed = mcpConfig ? JSON.parse(mcpConfig) : { mcpServers: {} };
			parsed.mcpServers = {
				...parsed.mcpServers || {},
				...projectMcpServers
			};
			mcpConfig = JSON.stringify(parsed);
		} catch {
			sidecarLog.warn("[ProjectMcp] failed to merge project MCP servers into --mcp-config");
		}
		const agentExtraEnv = await (this.dependencies.getAgentExtraEnv?.() ?? {});
		Object.assign(env, agentExtraEnv);
		if (mcpConfig && this.sessionId) try {
			const parsed = JSON.parse(mcpConfig);
			const proxyConfig = parsed.mcpServers?.[require_workbuddy_auth_product_coordinator.CONNECTOR_PROXY_MCP_NAME];
			if (proxyConfig) {
				const projectId = this.env?.["CODEBUDDY_PROJECT_ID"];
				proxyConfig.headers = {
					...proxyConfig.headers || {},
					[require_workbuddy_auth_product_coordinator.WORKBUDDY_SESSION_ID_HEADER]: this.sessionId,
					...this.runtimeConfig.welcomeMode ? { [require_workbuddy_auth_product_coordinator.WORKBUDDY_WELCOME_MODE_HEADER]: this.runtimeConfig.welcomeMode } : {},
					...projectId ? { [require_workbuddy_auth_product_coordinator.WORKBUDDY_PROJECT_ID_HEADER]: projectId } : {}
				};
				mcpConfig = JSON.stringify(parsed);
				sidecarLog.info(`[ArdotSessionFix] injected ${require_workbuddy_auth_product_coordinator.WORKBUDDY_SESSION_ID_HEADER}=${this.sessionId} ${require_workbuddy_auth_product_coordinator.WORKBUDDY_WELCOME_MODE_HEADER}=${this.runtimeConfig.welcomeMode ?? "(unset)"} into --mcp-config`);
			} else sidecarLog.warn(`[ArdotSessionFix] --mcp-config has no '${require_workbuddy_auth_product_coordinator.CONNECTOR_PROXY_MCP_NAME}' entry, skip session header injection`);
		} catch {
			sidecarLog.warn("[ArdotSessionFix] failed to inject session header into --mcp-config");
		}
		const suppressLegacySystemPrompt = shouldSuppressLegacySystemPrompt(this.runtimeConfig);
		this.systemPromptFile = writeAgentCliSystemPromptFile(this.sessionId, suppressLegacySystemPrompt ? void 0 : this.runtimeConfig.systemPrompt);
		this.promptVarsFile = writeAgentCliPromptVarsFile(this.sessionId, this.runtimeConfig.promptVariables);
		const isClawSession = isClawWorkspaceCwd(this.cwd);
		const hostCapabilitiesEnv = {};
		if (!isClawSession) hostCapabilitiesEnv.CODEBUDDY_HOST_CAPABILITIES = "elicitation.form,weixinpay.interception";
		sidecarLog.info(`[CodeBuddyCodeBackend] initializeInternal: host capabilities env sessionId=${this.sessionId}, isClaw=${isClawSession}, value=${hostCapabilitiesEnv.CODEBUDDY_HOST_CAPABILITIES ?? "(not set)"}`);
		const runtimeParams = {
			sessionId: this.sessionId,
			command: electronPath,
			args: [
				cliPath,
				...port === 0 || shouldUseServeMode(this.dependencies) ? ["--serve"] : [],
				"--session-id",
				this.sessionId,
				...buildArgs(this.runtimeConfig, this.cwd, mcpConfig, this.systemPromptFile, this.promptVarsFile, {
					getSystemLocale: this.dependencies.getSystemLocale,
					getConfigDir: this.dependencies.getConfigDir,
					getUserDataDir: this.dependencies.getUserDataDir,
					readAppConfigValue: this.dependencies.readAppConfigValue
				}, this.dependencies.resolveCliEnvRouteMode?.())
			],
			cwd: this.cwd,
			env: {
				...env,
				...hostCapabilitiesEnv,
				...require_cli_process_env.CLI_STATIC_MANAGED_ENV
			},
			port
		};
		const promptVariableKeys = Object.keys(this.runtimeConfig.promptVariables ?? {}).sort();
		const promptVariablesTotalLength = Object.values(this.runtimeConfig.promptVariables ?? {}).reduce((sum, value) => sum + value.length, 0);
		sidecarLog.info(`${TAG} initializeInternal: runtime args prepared, sessionId=${this.sessionId} argsSummary=${summarizePrewarmArgs(runtimeParams.args ?? [])} promptVarsKeys=[${promptVariableKeys.join(",")}] promptVarsTotalLength=${promptVariablesTotalLength}`);
		const prepareMs = performance.now() - tMark;
		tMark = performance.now();
		sidecarLog.info(`[CodeBuddyCodeBackend] initializeInternal: creating runtime session, sessionId=${this.sessionId}, port=${port}, cwd=${this.cwd}`);
		const sessionDeltaEnv = {
			...connectorTokenEnv,
			...agentTeamsEnv,
			...agentExtraEnv,
			...projectSessionExtra,
			...qimeiEnv,
			...hostCapabilitiesEnv
		};
		sidecarLog.info(`[CodeBuddyCodeBackend] initializeInternal: host capability handoff sessionId=${this.sessionId}, runtimeEnv=${runtimeParams.env.CODEBUDDY_HOST_CAPABILITIES ?? "(not set)"}, deltaEnv=${sessionDeltaEnv.CODEBUDDY_HOST_CAPABILITIES ?? "(not set)"}, deltaEnvKeys=[${Object.keys(sessionDeltaEnv).join(",")}]`);
		const runtimeHandle = await this.acquireRuntime(runtimeParams, sessionDeltaEnv, new Set(Object.keys(connectorTokenEnv)));
		const sidecarMs = performance.now() - tMark;
		this.runtimeStarted = true;
		this.runtimeEverStarted = true;
		this.acpEndpoint = runtimeHandle.acpEndpoint;
		sidecarLog.info(`[CodeBuddyCodeBackend] initializeInternal: runtime created, sessionId=${this.sessionId}, acpEndpoint=${runtimeHandle.acpEndpoint}, sidecarMs=${Math.round(sidecarMs)}ms, prewarmHit=${this.prewarmActivated}`);
		this.reportPrewarmHit(this.prewarmActivated, sidecarMs);
		const client = this.createClient(runtimeHandle.acpEndpoint);
		this.client = client;
		try {
			this.throwIfPreempted(myEpoch);
			tMark = performance.now();
			await this.connectClient(runtimeHandle.acpEndpoint, client);
			this.throwIfPreempted(myEpoch);
			const connectMs = performance.now() - tMark;
			const connection = this.getConnection();
			let sessionMcpServers = request.request.mcpServers || [];
			if (mcpConfig) try {
				const parsed = JSON.parse(mcpConfig);
				const proxyServers = parsed.mcpServers || parsed;
				sessionMcpServers = [...Object.entries(proxyServers).map(([name, config]) => {
					const meta = {};
					if (config.defer_loading !== void 0) meta.defer_loading = config.defer_loading;
					if (config.tools) meta.tools = config.tools;
					if (config.transparent_proxy !== void 0) meta.transparent_proxy = config.transparent_proxy;
					if (config.builtin_tools) meta.builtin_tools = config.builtin_tools;
					const headers = config.headers ? Object.entries(config.headers).map(([headerName, value]) => ({
						name: headerName,
						value
					})) : [];
					if (name === "connector-proxy" && this.sessionId) headers.push({
						name: require_workbuddy_auth_product_coordinator.WORKBUDDY_SESSION_ID_HEADER,
						value: this.sessionId
					});
					return {
						name,
						type: config.type || "http",
						url: config.url,
						headers,
						_meta: meta
					};
				}), ...sessionMcpServers];
			} catch {}
			tMark = performance.now();
			const requestMeta = request.request._meta ?? {};
			const requestCodebuddyMeta = requestMeta["codebuddy.ai"] ?? {};
			const sessionLoadMeta = {
				...requestMeta,
				...this.runtimeConfig.sessionSettings ? { "codebuddy.ai": {
					...requestCodebuddyMeta,
					sessionSettings: this.runtimeConfig.sessionSettings
				} } : {}
			};
			if (request.kind === "load" || request.kind === "resume") {
				const attachRequest = {
					...request.request,
					mcpServers: sessionMcpServers,
					_meta: sessionLoadMeta
				};
				if (request.kind === "load") await connection.loadSession(attachRequest);
				else await connection.resumeSession(attachRequest);
			} else await connection.loadSession({
				sessionId: this.sessionId,
				cwd: request.request.cwd,
				mcpServers: sessionMcpServers,
				_meta: {
					...sessionLoadMeta,
					"codebuddy.ai/continue": true
				}
			});
			this.throwIfPreempted(myEpoch);
			const sessionLoadMs = performance.now() - tMark;
			const totalMs = performance.now() - t0;
			this.dependencies.storeSessionCreateTiming?.(this.sessionId, {
				isColdStart: sidecarMs > 1e3,
				totalMs: Math.round(totalMs),
				findPortMs: Math.round(findPortMs),
				prepareMs: Math.round(prepareMs),
				sidecarMs: Math.round(sidecarMs),
				waitForPortMs: Math.round(this._lastWaitForPortMs ?? 0),
				acpConnectMs: Math.round(connectMs - (this._lastWaitForPortMs ?? 0)),
				sessionLoadMs: Math.round(sessionLoadMs)
			});
			this._lastWaitForPortMs = void 0;
			await Promise.all([...this.lastSessionConfigOptions].map(async ([configId, value]) => {
				try {
					await connection.extMethod("session/set_config_option", {
						sessionId: this.sessionId,
						configId,
						value,
						...configId === "sandbox" && value === "false" && this.lastSandboxDisabledReason ? { _meta: { [SANDBOX_DISABLED_REASON_META_KEY]: this.lastSandboxDisabledReason } } : {}
					});
				} catch (err) {
					sidecarLog.warn(`${TAG} initializeInternal: replay set_config_option(${configId}=${value}) failed: ${err?.message ?? err}`);
				}
			}));
			return { sessionId: this.sessionId };
		} catch (error) {
			this.logDiagnostic("error", "initializeInternal() failed; cleaning up transport state", {
				sessionId: this.sessionId,
				endpoint: this.acpEndpoint,
				hadClient: !!this.client,
				runtimeStarted: this.runtimeStarted,
				error: serializeBackendErrorForLog(error)
			});
			const enrichedError = await this.enrichInitializationError(error);
			const client = this.client;
			this.client = null;
			this.acpEndpoint = null;
			if (client) await Promise.race([client.disconnect().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 2e3))]);
			if (this.runtimeStarted) {
				await this.killRuntimeSession();
				this.runtimeStarted = false;
			}
			cleanupAgentCliSystemPromptFile(this.systemPromptFile);
			this.systemPromptFile = null;
			cleanupAgentCliPromptVarsFile(this.promptVarsFile);
			this.promptVarsFile = null;
			throw enrichedError;
		}
	}
	getSessionId() {
		return this.sessionId;
	}
	/**
	* 上报一次 prewarm 命中事件到 aegis 通道（→ 伽利略）。
	*
	* 语义：每个 cbc runtime 创建可用后调用一次，命中（复用预热进程）与未命中
	* （回退冷启动）都上报，用 `prewarm_hit` 字段区分——伽利略侧按该字段聚合即可
	* 算出预热池命中率。`sidecar_ms` 记录本次 runtime 就绪耗时，便于对照命中 vs
	* 冷启动的启动收益。
	*
	* 走全局 aegis-bridge（与 session_no_response_timeout 同源），无需把 reporter
	* 线程注入 backend 依赖。reporter 未就绪 / 上报抛错时静默降级——telemetry
	* 绝不能影响会话建立。
	*/
	reportPrewarmHit(hit, sidecarMs) {
		try {
			const reportEvent = require_log_acl_guard.getAegisReporter();
			if (typeof reportEvent !== "function") return;
			reportEvent("prewarm_hit", {
				prewarm_hit: String(hit),
				sidecar_ms: Math.round(sidecarMs),
				session_id: this.sessionId ?? ""
			});
		} catch {}
	}
	/**
	* 统一 runtime 会话获取入口：优先走 prewarm 池，未命中 / 失败回退冷启动。
	*
	* sessionDeltaEnv 是"按 session 变化的 env 增量"——agent-teams 开关、
	* connector token 等。pool 用它做两件事：
	* 1. 白名单兜底（防止未审计的 env 维度静默漏传）
	* 2. activate 时透传给 prewarm 进程，由 prewarm 进程合并到 process.env
	*
	* activate 使用 `--port 0` 让内核分配端口；agent-cli 只在 ACP 路由完成
	* 初始化后，才通过原 activate IPC 连接返回带 pid/sessionId 的 ready ACK。
	* 任何 prewarm 路径上的异常一律回退到 `runtimeManager.createSession()`，
	* 保证 prewarm 只做加速、不影响会话能否建立。
	*/
	async acquireRuntime(params, sessionDeltaEnv, trustedSessionEnvKeys = /* @__PURE__ */ new Set()) {
		const pool = this.dependencies.cliPrewarmPool;
		if (pool && !this.isBackgroundAutomation) {
			const acquired = pool.tryAcquire(sessionDeltaEnv, params.env, trustedSessionEnvKeys);
			if (acquired) {
				const activateArgs = buildPrewarmActivateArgs(params.args ?? [], 0);
				sidecarLog.info(`${TAG} [Prewarm] activate request: sessionId=${this.sessionId} cwd=${params.cwd} envKeys=[${Object.keys(sessionDeltaEnv).join(",")}] argsSummary=${summarizePrewarmArgs(activateArgs)}`);
				try {
					const activated = await acquired.activate({
						cwd: params.cwd,
						args: activateArgs,
						sessionId: this.sessionId
					});
					if (this.destroyed) {
						await pool.killSession(this.sessionId).catch(() => {});
						throw new Error(`${TAG} Session "${this.sessionId}" destroyed during prewarm activate`);
					}
					this.prewarmActivated = true;
					return { acpEndpoint: activated.acpEndpoint };
				} catch (err) {
					if (this.destroyed) throw err;
					sidecarLog.warn(`${TAG} prewarm acquire/activate failed, falling back to cold start: ${err instanceof Error ? err.message : String(err)}`);
				}
			}
		}
		const handle = await this.runtimeManager.createSession(params);
		if (this.destroyed) {
			await this.runtimeManager.killSession(this.sessionId).catch(() => {});
			throw new Error(`${TAG} Session "${this.sessionId}" destroyed during cold-start createSession`);
		}
		return { acpEndpoint: handle.acpEndpoint };
	}
	/**
	* 统一的 runtime 会话终止入口。
	*
	* 若本会话由 prewarm 池产生（`prewarmActivated=true`），让 pool 按 pid 终止；
	* 否则走原 `runtimeManager.killSession()`（sidecar 路径）。
	*
	* 调用方原有的 `.catch(() => {})` 兜底由本方法继承——失败仅日志告警，
	* 不抛错，避免在错误恢复路径上引入新的 reject。
	*/
	async killRuntimeSession() {
		const pool = this.dependencies.cliPrewarmPool;
		if (this.prewarmActivated && pool) try {
			const handled = await pool.killSession(this.sessionId);
			this.prewarmActivated = false;
			if (handled) {
				this.runtimeEverStarted = false;
				return;
			}
		} catch (err) {
			this.dependencies.logger?.warn?.(`${TAG} killRuntimeSession via pool failed for sessionId="${this.sessionId}"`, { error: err instanceof Error ? err.message : String(err) });
			this.prewarmActivated = false;
		}
		await this.runtimeManager.killSession(this.sessionId).catch(() => {});
		this.runtimeEverStarted = false;
	}
	async reconfigure(request) {
		const nextConfig = normalizeRuntimeConfig(request.runtimeConfig);
		const current = this.runtimeConfig;
		const desiredAgentTeamsEnv = this.dependencies.getAgentTeamsEnv?.(this.sessionId);
		if (desiredAgentTeamsEnv !== this.lastAppliedAgentTeamsEnv) {
			sidecarLog.info(`[CodeBuddyCodeBackend] reconfigure: agent-teams env drift sessionId=${this.sessionId} applied=${this.lastAppliedAgentTeamsEnv ?? "(unset)"} desired=${desiredAgentTeamsEnv ?? "(unset)"}; restart required`);
			return {
				kind: "restart_required",
				reason: "agent-teams env drift"
			};
		}
		if (isSameRuntimeConfig(current, nextConfig)) return { kind: "noop" };
		if (current.tools !== nextConfig.tools) {
			this.logDiagnostic("info", "reconfigure() tools diff detected", {
				sessionId: this.sessionId,
				currentToolsLength: current.tools?.length ?? 0,
				nextToolsLength: nextConfig.tools?.length ?? 0,
				currentToolsPreview: current.tools?.slice(0, 200),
				nextToolsPreview: nextConfig.tools?.slice(0, 200),
				currentIsUndefined: current.tools === void 0,
				nextIsUndefined: nextConfig.tools === void 0
			});
			return {
				kind: "restart_required",
				reason: "tools changed"
			};
		}
		if (getRestartIdentity(current) !== getRestartIdentity(nextConfig)) return {
			kind: "restart_required",
			reason: "restart fingerprint changed"
		};
		if (current.runtimeIdentity !== nextConfig.runtimeIdentity) return {
			kind: "restart_required",
			reason: "runtime identity changed"
		};
		if (current.permissionModeBeforePlan !== nextConfig.permissionModeBeforePlan) return {
			kind: "restart_required",
			reason: "permission mode before plan changed"
		};
		if (current.welcomeMode !== nextConfig.welcomeMode) return {
			kind: "restart_required",
			reason: "welcomeMode changed"
		};
		if (stableJsonStringify(current.promptVariables) !== stableJsonStringify(nextConfig.promptVariables)) return {
			kind: "restart_required",
			reason: "prompt variables changed"
		};
		if (current.permissionMode !== nextConfig.permissionMode && nextConfig.permissionMode) {
			const effectiveMode = normalizeBackendPermissionMode(nextConfig.permissionMode);
			this.logDiagnostic("info", "reconfigure() permissionMode change", {
				sessionId: this.sessionId,
				from: current.permissionMode,
				requested: nextConfig.permissionMode,
				effective: effectiveMode
			});
			await this.setSessionMode({ modeId: effectiveMode });
		}
		if (current.model !== nextConfig.model && nextConfig.model) await this.setSessionModel({ modelId: nextConfig.model });
		this.runtimeConfig = nextConfig;
		return { kind: "applied" };
	}
	async prompt(request) {
		this.promptSeq += 1;
		const traceMainReceiveTime = Date.now();
		const traceMeta = extractCodeBuddyPromptTraceMeta(request._meta);
		if (traceMeta) try {
			this.dependencies.reportPromptForwardingEvent?.({
				promptRequestId: traceMeta.promptRequestId,
				conversationId: traceMeta.conversationId,
				userId: traceMeta.userId,
				traceId: traceMeta.traceId
			});
		} catch {}
		let tracePromptOk = false;
		let tracePromptError;
		let traceCliTraceId;
		let traceOutcome;
		const runtimeRequest = materializeWorkbuddyRuntimePromptRequest(request);
		this.logDiagnostic("info", "prompt() entry", {
			sessionId: this.sessionId,
			hasClient: !!this.client,
			endpoint: this.acpEndpoint,
			destroyed: this.destroyed,
			savedInitKind: this.initializeRequest?.kind ?? null
		});
		const attemptPrompt = async () => {
			await this.ensureInitialized();
			const ensureResult = ensureAgentCliPromptVarsFile(this.sessionId, this.promptVarsFile, this.runtimeConfig.promptVariables);
			this.promptVarsFile = ensureResult.filePath;
			if (ensureResult.status === "restored") this.logDiagnostic("warn", "prompt vars file restored before prompt", {
				sessionId: this.sessionId,
				reason: ensureResult.reason
			});
			return this.getConnection().prompt({
				sessionId: this.sessionId,
				...runtimeRequest
			});
		};
		try {
			const result = await attemptPrompt();
			traceCliTraceId = extractCliTraceId(result._meta);
			traceOutcome = extractCliOutcome(result._meta);
			tracePromptOk = true;
			return result;
		} catch (error) {
			tracePromptError = error instanceof Error ? error.message : String(error);
			traceCliTraceId = extractCliTraceIdFromError(error);
			if (await this.softResetAfterLocalEndpointUnavailable("prompt()", error)) {
				this.logDiagnostic("warn", "prompt() retrying once after local ACP endpoint unavailable", {
					sessionId: this.sessionId,
					request: summarizePromptRequestForLog(runtimeRequest)
				});
				try {
					const result = await attemptPrompt();
					traceCliTraceId = extractCliTraceId(result._meta);
					traceOutcome = extractCliOutcome(result._meta);
					tracePromptOk = true;
					return result;
				} catch (retryError) {
					tracePromptError = retryError instanceof Error ? retryError.message : String(retryError);
					traceCliTraceId = extractCliTraceIdFromError(retryError);
					this.logDiagnostic("error", "prompt() failed after local ACP endpoint reset", {
						sessionId: this.sessionId,
						endpoint: this.acpEndpoint,
						request: summarizePromptRequestForLog(runtimeRequest),
						clientState: this.client?.debugState?.(),
						error: serializeBackendErrorForLog(retryError)
					});
					throw retryError;
				}
			}
			if (isRecoverablePromptTransportError(error, this.acpEndpoint)) {
				this.logDiagnostic("warn", "prompt() transport failed; soft resetting before next explicit prompt", {
					sessionId: this.sessionId,
					endpoint: this.acpEndpoint,
					request: summarizePromptRequestForLog(runtimeRequest),
					clientState: this.client?.debugState?.(),
					error: serializeBackendErrorForLog(error)
				});
				await this.softReset("prompt():recoverable-transport-error");
				throw error;
			}
			this.logDiagnostic("error", "prompt() failed", {
				sessionId: this.sessionId,
				endpoint: this.acpEndpoint,
				request: summarizePromptRequestForLog(runtimeRequest),
				clientState: this.client?.debugState?.(),
				error: serializeBackendErrorForLog(error)
			});
			throw error;
		} finally {
			if (traceMeta) {
				const tracePayload = {
					promptRequestId: traceMeta.promptRequestId,
					conversationId: traceMeta.conversationId,
					userId: traceMeta.userId,
					mainReceiveTime: traceMainReceiveTime,
					ok: tracePromptOk,
					errorMessage: tracePromptError,
					cliTraceId: traceCliTraceId,
					outcome: traceOutcome,
					traceId: traceMeta.traceId
				};
				try {
					this.dependencies.reportPromptDoneEvent?.(tracePayload);
				} catch {}
				try {
					this.dependencies.reportPromptTrace?.({
						...tracePayload,
						clientSendTime: traceMeta.clientSendTime,
						cliReturnTime: Date.now()
					})?.catch(() => {});
				} catch {}
			}
		}
	}
	async loadSession(request) {
		const attemptLoadSession = async () => {
			await this.ensureInitialized();
			const endpoint = this.acpEndpoint;
			if (!endpoint) throw new Error(`${TAG} Session "${this.sessionId}" has no ACP endpoint`);
			const hydrationClient = this.createClient(endpoint);
			try {
				await this.connectClient(endpoint, hydrationClient);
				await hydrationClient.connection.loadSession({
					sessionId: this.sessionId,
					...request
				});
			} finally {
				await hydrationClient.disconnect().catch(() => {});
			}
		};
		try {
			await attemptLoadSession();
		} catch (error) {
			if (await this.softResetAfterLocalEndpointUnavailable("loadSession()", error)) {
				this.logDiagnostic("warn", "loadSession() retrying once after local ACP endpoint unavailable", { sessionId: this.sessionId });
				await attemptLoadSession();
				return;
			}
			throw error;
		}
	}
	async cancel(request) {
		const promptSeqAtEntry = this.promptSeq;
		await this.ensureInitialized();
		if (this.promptSeq !== promptSeqAtEntry) {
			this.logDiagnostic("warn", "cancel() skipped: superseded by a newer prompt", {
				sessionId: this.sessionId,
				promptSeqAtEntry,
				promptSeqNow: this.promptSeq
			});
			return;
		}
		await this.getConnection().cancel({
			sessionId: this.sessionId,
			...request
		});
	}
	async setSessionMode(request) {
		await this.ensureInitialized();
		return this.getConnection().setSessionMode({
			sessionId: this.sessionId,
			...request
		});
	}
	async setSessionModel(request) {
		await this.ensureInitialized();
		return this.getConnection().unstable_setSessionModel({
			sessionId: this.sessionId,
			...request
		});
	}
	async setSandboxMode(enabled, disabledReason) {
		await this.setSessionConfigOptionInternal("sandbox", enabled ? "true" : "false", !enabled ? disabledReason : void 0);
	}
	/**
	* Sole owner of session config option delivery and its replay cache.
	* The cache is only written for values that were delivered or will be
	* (pre-connect / transient disconnect — the reconnect replay in
	* `initializeInternal` re-applies them); a hard rejection never enters
	* the cache, so a value the caller saw fail is never replayed later.
	*/
	async setSessionConfigOption(configId, value) {
		await this.setSessionConfigOptionInternal(configId, value);
	}
	cacheSessionConfigOption(configId, value, sandboxDisabledReason) {
		this.lastSessionConfigOptions.set(configId, value);
		if (configId === "sandbox") this.lastSandboxDisabledReason = value === "false" ? sandboxDisabledReason : void 0;
	}
	async setSessionConfigOptionInternal(configId, value, sandboxDisabledReason) {
		if (!this.client) {
			this.cacheSessionConfigOption(configId, value, sandboxDisabledReason);
			return;
		}
		try {
			await this.callSessionExtension("session/set_config_option", {
				configId,
				value,
				...sandboxDisabledReason ? { _meta: { [SANDBOX_DISABLED_REASON_META_KEY]: sandboxDisabledReason } } : {}
			});
		} catch (error) {
			if (isTransientAcpDisconnectError(error)) {
				sidecarLog.warn(`${TAG} set_config_option(${configId}=${value}) ignored disconnected ACP transport; cached for replay`);
				this.cacheSessionConfigOption(configId, value, sandboxDisabledReason);
				return;
			}
			throw error;
		}
		this.cacheSessionConfigOption(configId, value, sandboxDisabledReason);
	}
	respondToPermission(requestId, optionId) {
		return this.requireClient().resolvePermission(requestId, optionId);
	}
	rejectPermission(requestId, reason) {
		return this.requireClient().rejectPermission(requestId, reason);
	}
	respondToSandboxIntercept(requestId, choice) {
		try {
			this.getConnection().extMethod("_codebuddy.ai/respondToSandboxIntercept", {
				requestId,
				choice
			});
			return true;
		} catch (err) {
			sidecarLog.warn(`[CodeBuddyCodeBackend] respondToSandboxIntercept failed: ${err.message}`);
			return false;
		}
	}
	answerQuestion(toolCallId, answers) {
		return this.requireClient().answerQuestion(toolCallId, answers);
	}
	cancelQuestion(toolCallId, reason) {
		return this.requireClient().cancelQuestion(toolCallId, reason);
	}
	respondElicitation(elicitationId, action, content) {
		return this.requireClient().respondElicitation?.(elicitationId, action, content) ?? false;
	}
	async resolveInterruption(sessionId, toolCallId, decision, answers) {
		sidecarLog.info(`[CodeBuddyCodeBackend] resolveInterruption: sessionId=${sessionId}, toolCallId=${toolCallId}, decision=${decision}`);
		const client = this.requireClient();
		if (client.resolveInterruption) try {
			const result = await client.resolveInterruption(sessionId, toolCallId, decision, answers);
			sidecarLog.info(`[CodeBuddyCodeBackend] resolveInterruption: result=${result}`);
			return result;
		} catch (err) {
			sidecarLog.info(`[CodeBuddyCodeBackend] resolveInterruption: error ${err}`);
			return false;
		}
		sidecarLog.info("[CodeBuddyCodeBackend] resolveInterruption: client.resolveInterruption not available");
		return false;
	}
	async getAvailableCommands(params) {
		await this.ensureInitialized();
		return this.callSessionExtension("session/get_available_commands", params);
	}
	async getSubagentList(params) {
		await this.ensureInitialized();
		console.warn(`${TAG} getSubagentList is currently a registered no-op in desktop backend. Returning empty subagent list without forwarding to ACP.`, params ?? {});
		return {
			subagents: [],
			results: []
		};
	}
	async respondToSampling(response) {
		await this.ensureInitialized();
		await this.callSessionExtension("session/respond_to_sampling", { response });
	}
	async respondToRoots(response) {
		await this.ensureInitialized();
		await this.callSessionExtension("session/respond_to_roots", { response });
	}
	async requestYield() {
		await this.ensureInitialized();
		await this.callSessionExtension("session/request_yield");
	}
	async getMessageQueue() {
		await this.ensureInitialized();
		return this.callSessionExtension("session/get_message_queue");
	}
	async saveMessageQueue(data) {
		await this.ensureInitialized();
		await this.callSessionExtension("session/save_message_queue", data);
	}
	async enqueueMessage(contentBlocks) {
		await this.ensureInitialized();
		return this.callSessionExtension("session/enqueue_message", { contentBlocks });
	}
	async removeQueueItem(itemId) {
		await this.ensureInitialized();
		return this.callSessionExtension("session/remove_queue_item", { itemId });
	}
	async popQueueItemForEdit(itemId) {
		await this.ensureInitialized();
		return this.callSessionExtension("session/pop_queue_item_for_edit", { itemId });
	}
	async reorderQueue(orderedIds) {
		await this.ensureInitialized();
		return this.callSessionExtension("session/reorder_queue", { orderedIds });
	}
	async sendQueueItemNow(itemId) {
		await this.ensureInitialized();
		return this.callSessionExtension("session/send_queue_item_now", { itemId });
	}
	async activateMessageQueue() {
		await this.ensureInitialized();
		return this.callSessionExtension("session/activate_queue");
	}
	async pauseMessageQueue(reason) {
		await this.ensureInitialized();
		return this.callSessionExtension("session/pause_queue", reason ? { reason } : void 0);
	}
	async resumeMessageQueue() {
		await this.ensureInitialized();
		return this.callSessionExtension("session/resume_queue");
	}
	async cancelMessageQueue() {
		await this.ensureInitialized();
		return this.callSessionExtension("session/cancel_queue");
	}
	async getQueueState() {
		await this.ensureInitialized();
		return this.callSessionExtension("session/get_queue_state");
	}
	async detachOrphanClient(reason) {
		if (this.destroyed) return;
		const client = this.client;
		const endpoint = this.acpEndpoint;
		const hadRuntime = this.runtimeStarted;
		this.destroyed = true;
		this.resetEpoch += 1;
		this.initializePromise = null;
		this.client = null;
		this.acpEndpoint = null;
		this.runtimeStarted = false;
		this.logDiagnostic("warn", "detachOrphanClient triggered", {
			sessionId: this.sessionId,
			reason,
			endpoint,
			hadClient: !!client,
			hadRuntime
		});
		if (client) await Promise.race([client.disconnect().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 2e3))]);
		cleanupAgentCliSystemPromptFile(this.systemPromptFile);
		this.systemPromptFile = null;
		this.promptVarsFile = null;
		this.onDisposed?.(this);
	}
	/**
	* Force-terminate the sidecar runtime owned by this backend without
	* tearing down the backend object itself. Idempotent.
	*
	* Why this exists separately from `destroy()`:
	*   `restartSessionBackend()` first calls `requireCreateBackend()(...)`
	*   to build a replacement; that goes through `create()`, which detects
	*   the still-registered previous backend as an orphan and runs
	*   `detachOrphanClient('duplicate-session-backend')` to clear its
	*   transport. `detachOrphanClient` is intentionally non-destructive on
	*   the runtime — it sets `runtimeStarted = false` and returns, leaving
	*   the sidecar process alive so the new backend can reconnect to the
	*   same runtime (the original cure for the multi-SSE-subscription bug;
	*   see `create()` comment above).
	*
	*   But that's wrong for restart: when the restart was triggered by
	*   `tools changed` (or any other config delta that requires a fresh
	*   CLI process), the new backend MUST get a brand-new runtime, not
	*   reconnect to the old one. By the time `restartSessionBackend()`
	*   reaches `previousBackend.destroy()`, `runtimeStarted` is already
	*   false and the `if (this.runtimeStarted)` guard inside `destroy()`
	*   skips `killSession()`. So `destroy()` alone cannot kill the runtime
	*   in the restart path.
	*
	*   `releaseRuntime()` is the explicit knob `restartSessionBackend`
	*   calls to force the kill before `destroy()`. It does not depend on
	*   `runtimeStarted` because that flag has a transport-ownership
	*   meaning, not a runtime-liveness meaning, and may already be false.
	*   `runtimeManager.killSession()` is itself idempotent (the sidecar
	*   server short-circuits unknown / already-terminating sessions), so
	*   calling this against an already-dead runtime is safe.
	*/
	async releaseRuntime() {
		await this.killRuntimeSession();
		this.runtimeStarted = false;
	}
	async destroy() {
		const callsite = (() => {
			try {
				return (/* @__PURE__ */ new Error("destroy-callsite")).stack?.split("\n").slice(2, 6).map((line) => line.trim()).join(" | ");
			} catch {
				return;
			}
		})();
		this.logDiagnostic("info", "destroy() called", {
			sessionId: this.sessionId,
			alreadyDestroyed: this.destroyed,
			hadClient: !!this.client,
			hadRuntime: this.runtimeStarted,
			endpoint: this.acpEndpoint,
			callsite
		});
		this.destroyed = true;
		this.initializePromise = null;
		const client = this.client;
		this.client = null;
		this.acpEndpoint = null;
		if (client) await Promise.race([client.disconnect().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 2e3))]);
		if (this.runtimeStarted || this.prewarmActivated || this.runtimeEverStarted) {
			await this.killRuntimeSession();
			this.runtimeStarted = false;
		}
		cleanupAgentCliSystemPromptFile(this.systemPromptFile);
		this.systemPromptFile = null;
		cleanupAgentCliPromptVarsFile(this.promptVarsFile);
		this.promptVarsFile = null;
		this.onDisposed?.(this);
	}
	/**
	* Tear down the current ACP transport (client + endpoint + runtime session)
	* so the next `prompt()` / `loadSession()` goes through `initializeInternal`
	* again and performs a fresh `/connect` handshake.
	*
	* Unlike `destroy()`, `softReset()` keeps `initializeRequest` and
	* `this.destroyed = false`, so the session backend itself stays alive
	* and `ensureInitialized()` will re-initialize on demand.
	*
	* Called by `CodeBuddyCodeBackend.resetActiveSessions()` on auth owner
	* change — without this, the per-chat `WorkbuddyACPClient` keeps its
	* stale `connectionId`/`sessionToken` and the next POST to the CLI
	* fails with "transport failed" (logged by the client) which surfaces
	* as "not connected" in the UI. See issue #32662 / #32280.
	*/
	async softReset(reason) {
		if (this.destroyed) return;
		this.resetEpoch += 1;
		const client = this.client;
		const endpoint = this.acpEndpoint;
		const hadRuntime = this.runtimeStarted;
		this.client = null;
		this.acpEndpoint = null;
		this.runtimeStarted = false;
		this.logDiagnostic("info", "softReset triggered", {
			sessionId: this.sessionId,
			reason,
			endpoint,
			hadClient: !!client,
			hadRuntime
		});
		if (client) await Promise.race([client.disconnect().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 2e3))]);
		if (hadRuntime) await this.killRuntimeSession();
	}
	async softResetAfterLocalEndpointUnavailable(operation, error) {
		const endpoint = this.acpEndpoint;
		if (!isRecoverableLocalAcpEndpointUnavailable(error, endpoint)) return false;
		this.logDiagnostic("warn", `${operation} local ACP endpoint unavailable; clearing stale transport`, {
			sessionId: this.sessionId,
			endpoint,
			clientState: this.client?.debugState?.(),
			error: serializeBackendErrorForLog(error)
		});
		await this.softReset(`${operation}:local-acp-endpoint-unavailable`);
		return true;
	}
	/**
	* Invoke an arbitrary ACP extension method on the underlying AcpConnection.
	*
	* Unlike `callSessionExtension`, this does NOT inject `sessionId` — the
	* method is treated as agent-level (e.g. `_codebuddy.ai/refreshPlugins`).
	* Caller is responsible for passing any extra params the sidecar expects.
	*
	* If the client hasn't connected yet (initialize() not called), returns an
	* empty object instead of throwing. This keeps the controller-side fanout
	* in `host-services.notifyPluginChange()` non-fatal for sessions that are
	* still warming up — the sidecar will pick up the change via the next
	* prompt's natural cache read anyway, since settings-cache TTL is bounded.
	*/
	async extMethod(method, params) {
		if (!this.client) return {};
		return this.getConnection().extMethod(method, params);
	}
	async ensureInitialized() {
		if (this.client) return;
		if (this.destroyed) {
			this.logDiagnostic("error", "ensureInitialized() throwing \"has been destroyed\"", {
				sessionId: this.sessionId,
				hasInitializeRequest: !!this.initializeRequest
			});
			throw new Error(`${TAG} Session "${this.sessionId}" has been destroyed`);
		}
		if (this.dependencies.isAuthenticated && !this.dependencies.isAuthenticated()) {
			this.logDiagnostic("warn", "ensureInitialized() skipping re-initialize: not authenticated", { sessionId: this.sessionId });
			throw new Error(`${TAG} Session "${this.sessionId}" cannot initialize: not authenticated`);
		}
		if (!this.initializeRequest) {
			this.logDiagnostic("error", "ensureInitialized() throwing \"has not been initialized\"", { sessionId: this.sessionId });
			throw new Error(`${TAG} Session "${this.sessionId}" has not been initialized`);
		}
		this.logDiagnostic("info", "ensureInitialized() re-initializing (client=null, not destroyed)", {
			sessionId: this.sessionId,
			kind: this.initializeRequest.kind
		});
		await this.initialize(this.initializeRequest);
	}
	createClient(endpoint) {
		const createClient = this.dependencies.createClient ?? createWorkbuddyAgentAcpClient;
		const isClaw = isClawWorkspaceCwd(this.cwd);
		const supportsElicitation = !isClaw;
		sidecarLog.info(`[CodeBuddyCodeBackend] createClient: cwd=${this.cwd} isClaw=${isClaw} supportsElicitation=${supportsElicitation} sessionId=${this.sessionId}`);
		this.dependencies.logger?.info?.(`[CodeBuddyCodeBackend] createClient: cwd=${this.cwd} isClaw=${isClaw} supportsElicitation=${supportsElicitation}`);
		return createClient({
			endpoint,
			sessionId: this.sessionId,
			logger: this.dependencies.logger,
			supportsElicitation,
			authBearer: require_gateway_secret.getGatewaySecret(),
			onTransportActivity: (event) => {
				this.onTransportActivity?.(event);
			},
			onSessionUpdate: (notification) => {
				const payload = notification.sessionId === this.sessionId ? notification : {
					...notification,
					sessionId: this.sessionId
				};
				this.auditAdapter?.consume(payload)?.catch(() => void 0);
				this.onSessionUpdate?.(payload);
			},
			onExtNotification: (method, params) => {
				this.onExtNotification?.({
					method,
					params
				});
			},
			onQuestionRequest: (toolCallId, request) => {
				this.onQuestionRequest?.({
					toolCallId,
					request
				});
			},
			onElicitationRequest: (elicitationId, request) => {
				this.onElicitationRequest?.({
					elicitationId,
					request
				});
			},
			onPermissionRequest: (event) => {
				const params = {
					...event.params,
					sessionId: this.sessionId
				};
				this.onPermissionRequest?.({
					requestId: event.requestId,
					params
				});
			}
		});
	}
	logDiagnostic(level, message, details) {
		try {
			this.dependencies.logger?.[level]?.(`${TAG} ${message}${formatLogDetailsSuffix(details)}`);
		} catch {}
	}
	throwIfPreempted(myEpoch) {
		if (this.resetEpoch !== myEpoch) throw new Error(`${TAG} initializeInternal preempted by softReset`);
	}
	requireClient() {
		if (this.client) return this.client;
		throw new Error(`${TAG} Session "${this.sessionId}" is not initialized`);
	}
	getConnection() {
		return this.requireClient().connection;
	}
	async callSessionExtension(method, params) {
		const attempt = async () => {
			await this.ensureInitialized();
			return this.getConnection().extMethod(method, {
				sessionId: this.sessionId,
				...params ?? {}
			});
		};
		try {
			return await attempt();
		} catch (error) {
			if (await this.softResetAfterLocalEndpointUnavailable(`extMethod(${method})`, error)) {
				this.logDiagnostic("warn", "extMethod retrying once after local ACP endpoint unavailable", {
					sessionId: this.sessionId,
					method
				});
				return attempt();
			}
			throw error;
		}
	}
	async connectClient(endpoint, client) {
		const tWaitStart = performance.now();
		await (this.dependencies.waitForEndpoint ?? waitForEndpoint)(endpoint);
		this._lastWaitForPortMs = performance.now() - tWaitStart;
		const maxRetries = 3;
		let lastError;
		for (let attempt = 0; attempt < maxRetries; attempt += 1) try {
			await withTimeout$1(client.connect(), ACP_CONNECT_TIMEOUT_MS, `${TAG} Timed out connecting to ACP endpoint ${endpoint} after ${ACP_CONNECT_TIMEOUT_MS}ms`);
			return;
		} catch (error) {
			lastError = error;
			this.logDiagnostic("warn", "connectClient attempt failed", {
				sessionId: this.sessionId,
				endpoint,
				attempt: attempt + 1,
				maxRetries,
				willRetry: attempt < maxRetries - 1,
				error: serializeBackendErrorForLog(error)
			});
			await client.disconnect().catch(() => {});
			if (attempt < maxRetries - 1) {
				await new Promise((resolve) => setTimeout(resolve, ACP_CONNECT_RETRY_DELAY_MS));
				continue;
			}
			throw error;
		}
		throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error(`${TAG} Failed to connect to ACP endpoint ${endpoint}`);
	}
	async enrichInitializationError(error) {
		const baseError = error instanceof Error ? error : new Error(String(error));
		const startupOutput = await this.captureRuntimeOutput();
		if (startupOutput) this.logDiagnostic("error", "enrichInitializationError: captured CLI output", {
			sessionId: this.sessionId,
			outputLength: startupOutput.length,
			output: startupOutput.length > 3e3 ? startupOutput.slice(-3e3) : startupOutput
		});
		else this.logDiagnostic("warn", "enrichInitializationError: no CLI output captured", { sessionId: this.sessionId });
		if (!startupOutput) return baseError;
		const baseErrorWithData = baseError;
		const displayMessage = baseErrorWithData.data?.details || baseError.message;
		const enriched = /* @__PURE__ */ new Error(`${displayMessage}\n${TAG} Recent CLI output:\n${startupOutput}`);
		if (baseErrorWithData.code !== void 0 || baseErrorWithData.data !== void 0) Object.assign(enriched, {
			...baseErrorWithData.code !== void 0 ? { code: baseErrorWithData.code } : {},
			...baseErrorWithData.data !== void 0 ? { data: baseErrorWithData.data } : {}
		});
		if (baseError.stack) enriched.stack = `${enriched.message}\nCaused by:\n${baseError.stack}`;
		return enriched;
	}
	async captureRuntimeOutput(lines = 120) {
		const runtimeManager = this.runtimeManager;
		if (typeof runtimeManager.captureSession !== "function") return;
		try {
			return (await runtimeManager.captureSession(this.sessionId, lines)).trim() || void 0;
		} catch {
			return;
		}
	}
};
function buildPrewarmActivateArgs(coldStartArgs, port) {
	const out = [
		...coldStartArgs.slice(1),
		"--port",
		String(port)
	];
	const hasPort = out.includes("--port");
	const hasServe = out.includes("--serve");
	if (hasPort && !hasServe) out.unshift("--serve");
	return out;
}
function summarizePrewarmArgs(args) {
	const sensitiveValueFlags = new Set([
		"--system-prompt",
		"--append-system-prompt",
		"--settings"
	]);
	const out = [];
	for (let i = 0; i < args.length; i++) {
		const tok = args[i];
		if (!tok.startsWith("-")) {
			out.push(`<positional:${tok}>`);
			continue;
		}
		const next = args[i + 1];
		if (next === void 0 || next.startsWith("-")) {
			out.push(tok);
			continue;
		}
		if (sensitiveValueFlags.has(tok)) out.push(`${tok}=<len=${next.length}>`);
		else out.push(`${tok}=${next}`);
		i++;
	}
	return out.join(" ");
}
function buildArgs(options, cwd, mcpConfig, systemPromptFile, promptVarsFile, languageDeps = {}, envRouteMode) {
	const readAppConfigValue = languageDeps.readAppConfigValue ?? ((key) => {
		const { userDataDir } = require_cli_prewarm_pool.resolveAgentCliRuntimeDirs({
			getConfigDir: languageDeps.getConfigDir,
			getUserDataDir: languageDeps.getUserDataDir,
			homeDir: node_os.homedir(),
			processEnv: process.env,
			defaultConfigDirname: resolveDefaultConfigDirname()
		});
		return require_cli_prewarm_pool.readAgentCliAppConfigValue(key, { userDataDir });
	});
	return buildAgentCliRuntimeArgs({
		runtimeConfig: options,
		cwd,
		mcpConfig,
		systemPromptFile,
		promptVarsFile,
		language: resolveCliSettingsLanguage({
			...languageDeps,
			readAppConfigValue
		}),
		envRouteMode
	});
}
function normalizeRuntimeConfig(config) {
	const normalized = {
		model: config?.model,
		systemPrompt: config?.systemPrompt,
		restartFingerprint: config?.restartFingerprint,
		tools: config?.tools,
		permissionMode: config?.permissionMode,
		permissionModeBeforePlan: config?.permissionModeBeforePlan,
		sessionSettings: config?.sessionSettings,
		promptVariables: config?.promptVariables,
		addonManifest: config?.addonManifest
	};
	if (config?.runtimeIdentity) normalized.runtimeIdentity = config.runtimeIdentity;
	if (config?.welcomeMode) normalized.welcomeMode = config.welcomeMode;
	return normalized;
}
function getRestartIdentity(config) {
	return config.restartFingerprint ?? config.systemPrompt;
}
function isPlainObject(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function stableJsonStringify(value) {
	if (Array.isArray(value)) return `[${value.map((item) => stableJsonStringify(item)).join(",")}]`;
	if (isPlainObject(value)) return `{${Object.keys(value).sort().filter((key) => value[key] !== void 0).map((key) => `${JSON.stringify(key)}:${stableJsonStringify(value[key])}`).join(",")}}`;
	return JSON.stringify(value);
}
function isSameRuntimeConfig(left, right) {
	return left.model === right.model && getRestartIdentity(left) === getRestartIdentity(right) && left.tools === right.tools && left.permissionMode === right.permissionMode && left.permissionModeBeforePlan === right.permissionModeBeforePlan && stableJsonStringify(left.sessionSettings) === stableJsonStringify(right.sessionSettings) && stableJsonStringify(left.promptVariables) === stableJsonStringify(right.promptVariables) && left.runtimeIdentity === right.runtimeIdentity && left.welcomeMode === right.welcomeMode;
}
async function waitForEndpoint(acpEndpoint) {
	return waitForAgentCliLocalAcpEndpoint(acpEndpoint, {
		timeoutMs: ACP_ENDPOINT_WAIT_TIMEOUT_MS,
		logger: sidecarLog,
		logPrefix: TAG
	});
}
async function withTimeout$1(promise, timeoutMs, message) {
	let timer;
	try {
		return await Promise.race([promise, new Promise((_, reject) => {
			timer = setTimeout(() => reject(new Error(message)), timeoutMs);
		})]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}
var CLINotFoundError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "CLINotFoundError";
	}
};
function resolveCLIPath(dependencies = {}) {
	const resolveAsset = dependencies.resolveBundledAsset ?? defaultResolveBundledAsset;
	const bundled = resolveAsset("cli", "bin", "codebuddy") ?? resolveAsset("cli", "dist", "codebuddy.js");
	const envPath = process.env.CODEBUDDY_CODE_PATH;
	const resolution = require_cli_prewarm_pool.resolveAgentCliExecutablePath({
		bundledCliPaths: [bundled],
		envCliPath: envPath
	});
	if (resolution?.source === "env") sidecarLog.warn(`[CodeBuddyCodeBackend] resolveCLIPath: bundled CLI not found, falling back to CODEBUDDY_CODE_PATH=${envPath}`);
	if (resolution) return resolution.path;
	throw new CLINotFoundError("CLI not found.\n\nSearched:\n  - cli/bin/codebuddy\n  - cli/dist/codebuddy.js\n" + (envPath ? `  - CODEBUDDY_CODE_PATH: ${envPath}\n` : "") + "\nRun: node scripts/copy-cli.js");
}
function buildEnv(extra, options = {}) {
	const { configDir, userDataDir } = require_cli_prewarm_pool.resolveAgentCliRuntimeDirs({
		getConfigDir: options.getConfigDir,
		getUserDataDir: options.getUserDataDir,
		homeDir: node_os.homedir(),
		processEnv: process.env,
		defaultConfigDirname: (options.resolveDefaultConfigDirname ?? resolveDefaultConfigDirname)()
	});
	const productEnv = require_cli_product_env.resolveAgentCliProductEnv({
		processEnv: process.env,
		fallbackProductConfigEnv: process.env.ACC_PRODUCT_CONFIG_V3 ? void 0 : (options.getBootstrapProductConfigEnv ?? defaultGetBootstrapProductConfigEnv)()
	});
	const localRuntimePathOptions = {
		homeDir: node_os.homedir(),
		platform: process.platform
	};
	const sandboxNativeEnv = resolveSandboxNativeEnv({
		processEnv: process.env,
		platform: process.platform,
		processExecPath: process.execPath,
		resolveCliPath: () => resolveCLIPath(options)
	});
	return require_cli_prewarm_pool.buildAgentCliRuntimeEnv({
		configDir,
		userDataDir,
		builtinSkillsDir: resolveBuiltinSkillsDir(options.requireBundledAsset),
		productConfigEnv: productEnv.productConfigEnv,
		productConfigPathEnv: productEnv.productConfigPathEnv,
		hostedCliInternetEnv: productEnv.hostedCliInternetEnv,
		clientInfoEnv: require_client_info_env.buildWorkbuddyClientInfoEnv({
			getAppVersion: options.getAppVersion,
			resolveBundledAsset: options.resolveBundledAsset ?? defaultResolveBundledAsset
		}),
		pluginDirs: require_cli_prewarm_pool.listAgentCliEnabledPluginDirs(configDir).join(path.delimiter),
		proxyEnv: (options.getProcessProxyEnv ?? getProxyEnvFromProcess$1)(),
		cliConnectorBin: require_cli_prewarm_pool.resolveAgentCliConnectorBin(localRuntimePathOptions),
		pythonConnectorEnvBin: require_cli_prewarm_pool.resolveAgentCliPythonEnvBin(localRuntimePathOptions),
		managedNodeBinDirs: require_cli_prewarm_pool.listAgentCliManagedBinDirs({
			...localRuntimePathOptions,
			binaryType: "node"
		}),
		managedPythonBinDirs: require_cli_prewarm_pool.listAgentCliManagedBinDirs({
			...localRuntimePathOptions,
			binaryType: "python"
		}),
		bundledRuntimeConfig: require_cli_prewarm_pool.readAgentCliBundledRuntimeConfig(userDataDir),
		registeredBinaryTypes: require_client_info_env.getRegisteredBinaryTypes(),
		processEnv: process.env,
		pathDelimiter: path.delimiter,
		extra: {
			...sandboxNativeEnv,
			...extra
		}
	});
}
function resolveSandboxNativeEnv(options) {
	if (options.platform !== "darwin" || options.processEnv.SANDBOX_FILE_VERSION_MANAGEMENT_ENABLED !== "true") return {};
	const env = {};
	if (options.processEnv.SANDBOX_APP_GROUP_ID) env.SANDBOX_APP_GROUP_ID = options.processEnv.SANDBOX_APP_GROUP_ID;
	else try {
		const cliDir = node_path.resolve(node_path.dirname(options.resolveCliPath()), "..");
		const sandboxConfigPath = node_path.join(cliDir, "sandbox-config.json");
		const sandboxConfig = JSON.parse(node_fs.readFileSync(sandboxConfigPath, "utf8"));
		if (typeof sandboxConfig.appGroupId === "string" && sandboxConfig.appGroupId) env.SANDBOX_APP_GROUP_ID = sandboxConfig.appGroupId;
	} catch {}
	if (options.processExecPath && options.processExecPath.includes(".app/Contents/MacOS/")) env.SANDBOX_ELECTRON_APP_PATH = node_path.resolve(options.processExecPath, "..", "..", "..");
	if (options.processEnv.SANDBOX_HELPER_HEALTHCHECK_ENABLED) env.SANDBOX_HELPER_HEALTHCHECK_ENABLED = options.processEnv.SANDBOX_HELPER_HEALTHCHECK_ENABLED;
	return env;
}
function resolveBuiltinSkillsDir(requireAsset = defaultRequireBundledAsset) {
	return require_cli_prewarm_pool.normalizeAgentCliBuiltinSkillsDir(requireAsset("plugins", "workbuddy-builtin", "skills"));
}
function materializeWorkbuddyRuntimePromptRequest(request) {
	const prompt = materializeWorkbuddyRuntimePrompt(request.prompt);
	if (!prompt) return request;
	return {
		...request,
		prompt
	};
}
var PREPEND_SLASH_COMMAND_ALLOWLIST = new Set(["/compact"]);
function materializeWorkbuddyRuntimePrompt(prompt) {
	if (!Array.isArray(prompt) || prompt.length === 0) return;
	const normalizedPromptBlocks = [];
	const imageBlocks = [];
	let commandName;
	for (const block of prompt) switch (block.type) {
		case "text":
			normalizedPromptBlocks.push({
				...block,
				text: normalizePromptTextForCli(block.text)
			});
			break;
		case "resource_link": {
			const meta = block._meta ?? {};
			if (meta.mentionType === "inspiration" && meta.detail) return;
			if (!require_workbuddy_auth_product_coordinator.isInlineEncodableResourceLink({
				uri: block.uri,
				meta
			})) return;
			if (meta.isCommand === true && typeof block.name === "string" && block.name.startsWith("/") && PREPEND_SLASH_COMMAND_ALLOWLIST.has(block.name)) commandName = block.name;
			normalizedPromptBlocks.push(block);
			break;
		}
		case "image":
			if (!isSupportedPromptImageBlock(block)) return;
			normalizedPromptBlocks.push(block);
			imageBlocks.push(structuredClone(block));
			break;
		default: return;
	}
	if (commandName) {
		const { expertSelectionBlocks, remainingBlocks } = partitionExpertSelectionBlocks(normalizedPromptBlocks.filter((block) => {
			if (block.type !== "resource_link") return true;
			return !((block._meta ?? {}).isCommand === true && block.name === commandName);
		}));
		const residualText = require_workbuddy_auth_product_coordinator.extractRuntimePromptText(remainingBlocks);
		const blocks = [{
			type: "text",
			text: commandName
		}];
		blocks.push(...expertSelectionBlocks);
		if (residualText) blocks.push({
			type: "text",
			text: residualText
		});
		blocks.push(...imageBlocks);
		return blocks;
	}
	const { expertSelectionBlocks, remainingBlocks } = partitionExpertSelectionBlocks(normalizedPromptBlocks);
	const runtimeText = require_workbuddy_auth_product_coordinator.extractRuntimePromptText(remainingBlocks);
	if (expertSelectionBlocks.length === 0 && !runtimeText && imageBlocks.length === 0) return;
	return [
		...expertSelectionBlocks,
		...runtimeText ? [{
			type: "text",
			text: runtimeText
		}] : [],
		...imageBlocks
	];
}
function partitionExpertSelectionBlocks(blocks) {
	const expertSelectionBlocks = [];
	const remainingBlocks = [];
	for (const block of blocks) {
		const meta = block._meta;
		if (block.type === "text" && meta?.["codebuddy.ai/expertSelection"] === true) expertSelectionBlocks.push(block);
		else remainingBlocks.push(block);
	}
	return {
		expertSelectionBlocks,
		remainingBlocks
	};
}
function normalizePromptTextForCli(text) {
	const mcpMatch = text.match(/^\/mcp:([^:\s]+):(\S+)(\s+.*)?$/);
	if (!mcpMatch) return text;
	const [, server, command, args] = mcpMatch;
	return `/${server}:${command} (MCP)${args || ""}`;
}
function isSupportedPromptImageBlock(block) {
	return block.type === "image" && (typeof block.data === "string" || typeof block.uri === "string" && block.uri.startsWith("http"));
}
function summarizePromptRequestForLog(request) {
	const meta = request._meta && typeof request._meta === "object" ? request._meta : void 0;
	return {
		promptItemCount: Array.isArray(request.prompt) ? request.prompt.length : 0,
		promptItemTypes: Array.isArray(request.prompt) ? request.prompt.slice(0, 10).map((item) => item && typeof item === "object" && typeof item.type === "string" ? item.type : typeof item) : [],
		messageId: request.messageId,
		metaKeys: meta ? Object.keys(meta).slice(0, 20) : [],
		requestId: meta && typeof meta["codebuddy.ai/requestId"] === "string" ? meta["codebuddy.ai/requestId"] : void 0
	};
}
function resolveDefaultConfigDirname() {
	return ".workbuddy";
}
function serializeBackendErrorForLog(error) {
	if (error instanceof Error) {
		const errorWithExtras = error;
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			code: errorWithExtras.code,
			data: sanitizeBackendLogValue(errorWithExtras.data),
			cause: errorWithExtras.cause ? serializeBackendErrorCauseForLog(errorWithExtras.cause) : void 0
		};
	}
	return { message: String(error) };
}
function serializeBackendErrorCauseForLog(error) {
	if (error instanceof Error) return serializeBackendErrorForLog(error);
	return String(error);
}
function isRecoverableLocalAcpEndpointUnavailable(error, endpoint) {
	if (!isLoopbackEndpoint(endpoint)) return false;
	return collectBackendErrorChain(error).some((item) => item.code === "ECONNREFUSED" || item.code === "AGENT_UNAVAILABLE" || /\bECONNREFUSED\b/i.test(item.message));
}
function isRecoverablePromptTransportError(error, endpoint) {
	if (!isLoopbackEndpoint(endpoint)) return false;
	return collectBackendErrorChain(error).some((item) => {
		const code = typeof item.code === "string" ? item.code : "";
		return code === "ECONNRESET" || code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT" || /\bECONNRESET\b|\bETIMEDOUT\b|\bUND_ERR_CONNECT_TIMEOUT\b/i.test(item.message) || /no response received|stream ended|transport failed|socket hang up/i.test(item.message);
	});
}
function isTransientAcpDisconnectError(error) {
	return collectBackendErrorChain(error).some((item) => isTransientDisconnectMessage(item.message));
}
function isLoopbackEndpoint(endpoint) {
	if (!endpoint) return false;
	try {
		const hostname = new URL(endpoint).hostname.toLowerCase();
		return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
	} catch {
		return false;
	}
}
function collectBackendErrorChain(error, seen = /* @__PURE__ */ new Set()) {
	if (error === null || error === void 0 || seen.has(error)) return [];
	seen.add(error);
	if (typeof error === "string") return [{ message: error }];
	if (typeof error !== "object") return [{ message: String(error) }];
	const value = error;
	return [{
		code: value.code,
		message: typeof value.message === "string" ? value.message : String(error)
	}, ...[...collectBackendErrorChain(value.cause, seen), ...Array.isArray(value.errors) ? value.errors.flatMap((item) => collectBackendErrorChain(item, seen)) : []]];
}
function sanitizeBackendLogValue(value, depth = 0) {
	if (depth >= 3) return "[truncated]";
	if (value == null || typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
	if (Array.isArray(value)) return value.slice(0, 10).map((item) => sanitizeBackendLogValue(item, depth + 1));
	if (value instanceof Error) return serializeBackendErrorForLog(value);
	if (typeof value === "object") {
		const entries = Object.entries(value).slice(0, 20);
		return Object.fromEntries(entries.map(([key, nested]) => [key, sanitizeBackendLogValue(nested, depth + 1)]));
	}
	return String(value);
}
function setDefaultWorkspaceRootConfigService(svc, logger = null) {
	configServiceRef = svc;
	loggerRef = logger;
}
function setDefaultWorkspaceRootAppNameProvider(provider) {
	appNameProvider = provider;
}
return {isRecord$10,stableStringify,sha256Hex,commandHash,DEFAULT_WORKSPACE_PATH_CONFIG_KEY,configServiceRef,loggerRef,appNameProvider,getSystemDefaultWorkspaceRoot,formatFsReason,warnDefaultWorkspaceRoot,clearConfiguredDefaultWorkspacePath,getDirReadyFailureReason,isDisallowedFilesystemRoot,getWorkspaceRootProbeFailureReason,validateDefaultWorkspaceRoot,resolveDefaultWorkspaceRoot,ensureClawCwd,resolveClawCwd,formatLogDetailsSuffix,safeStringifyLogDetails,serializeLogErrorForDetails,serializeLogErrorCauseForDetails,sanitizeLogDetailValue,SseParser,DEFAULT_CLIENT_CAPABILITIES,fetchWithTimeout,createIdleTimeout,WorkbuddyACPClient,summarizeAcpParamsForLog,serializeAcpErrorForLog,serializeAcpErrorCauseForLog,sanitizeAcpLogValue,safeStringifyAcpLogDetails,WORKBUDDY_AGENT_ACP_CLIENT_CONNECTION_TIMEOUT_MS,WORKBUDDY_AGENT_ACP_CLIENT_POST_TIMEOUT_MS,createWorkbuddyAgentAcpClient,WORKBUDDY_AGENT_ALLOWED_TOOLS,VALID_PERMISSION_MODES$1,normalizeBackendPermissionMode$1,shouldSuppressLegacySystemPrompt,shouldSuppressLegacyTools,buildAgentCliRuntimeArgs,AGENT_CLI_LOCAL_ACP_ENDPOINT_UNAVAILABLE_CODE,AGENT_CLI_PROMPT_VARS_RESTORE_FAILED_CODE,createAgentCliPromptVarsRestoreFailedError,writeAgentCliSystemPromptFile,getAgentCliPromptVarsFilePath,writeAgentCliPromptVarsFile,ensureAgentCliPromptVarsFile,inspectAgentCliPromptVarsFile,areAgentCliPromptVariablesEqual,cleanupAgentCliTempFile,cleanupAgentCliSystemPromptFile,cleanupAgentCliPromptVarsFile,waitForAgentCliLocalAcpEndpoint,createAgentCliLocalAcpEndpointUnavailableError,resolveCliSettingsLanguage,MAX_CACHE_SIZE,MAX_PARAM_LEN,META_TOOL_NAME,META_PERMISSION_RESOLVED,META_TOOL_CALL_ID,META_DECISION,TOOL_BASH,TOOL_WEB_FETCH,MCP_TOOL_PREFIX,TOOL_AUDIT_RULES,MCP_AUDIT_KEYS,createAuditAcpAdapter,isAuditedToolName,buildNamedToolEntry,buildMcpEntry,computeForensicHash,readMeta,readCodeBuddyMeta,readString,hasNonEmptyString,mapToolUpdateStatus,mapPermissionDecision,toAuditDecision,extractErrorMessage,truncateUtf16,isTransientDisconnectMessage,SANDBOX_DISABLED_REASON_META_KEY,TAG,ACP_ENDPOINT_WAIT_TIMEOUT_MS,ACP_CONNECT_TIMEOUT_MS,ACP_CONNECT_RETRY_DELAY_MS,USE_SYSTEM_CA_NODE_OPTION$1,CODEBUDDY_QIMEI36_ENV_KEY,isClawWorkspaceCwd,VALID_PERMISSION_MODES,normalizeBackendPermissionMode,sidecarLog,isProductionBuildLayout,defaultResolveBundledAsset,defaultRequireBundledAsset,defaultGetBootstrapProductConfigEnv,getProxyEnvFromProcess$1,defaultResolveProxyEnv,shouldUseServeMode,isValidHex32,readIsBackgroundAutomationMeta,extractCodeBuddyPromptTraceMeta,extractCliTraceId,extractCliOutcome,extractCliTraceIdFromError,CodeBuddyCodeBackend,CodeBuddyCodeSessionBackend,buildPrewarmActivateArgs,summarizePrewarmArgs,buildArgs,normalizeRuntimeConfig,getRestartIdentity,isPlainObject,stableJsonStringify,isSameRuntimeConfig,waitForEndpoint,withTimeout$1,CLINotFoundError,resolveCLIPath,buildEnv,resolveSandboxNativeEnv,resolveBuiltinSkillsDir,materializeWorkbuddyRuntimePromptRequest,PREPEND_SLASH_COMMAND_ALLOWLIST,materializeWorkbuddyRuntimePrompt,partitionExpertSelectionBlocks,normalizePromptTextForCli,isSupportedPromptImageBlock,summarizePromptRequestForLog,resolveDefaultConfigDirname,serializeBackendErrorForLog,serializeBackendErrorCauseForLog,isRecoverableLocalAcpEndpointUnavailable,isRecoverablePromptTransportError,isTransientAcpDisconnectError,isLoopbackEndpoint,collectBackendErrorChain,sanitizeBackendLogValue,setDefaultWorkspaceRootConfigService,setDefaultWorkspaceRootAppNameProvider,reporter:require_log_acl_guard,promptCodec:require_workbuddy_auth_product_coordinator};
}

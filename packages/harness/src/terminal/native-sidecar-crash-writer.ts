// @ts-nocheck
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';

export const ENTRY_SOURCE={"file":"crash-reporter.js","sha256":"430e76c48e0a2cb93d5060a1a58f98feae835b3f31cb3133618447f9a9a01396","regions":[{"from":826,"to":855},{"from":856,"to":893},{"from":894,"to":927},{"from":1113,"to":1683},{"from":1754,"to":2022},{"from":2023,"to":2045},{"from":2046,"to":2203},{"from":2465,"to":3214},{"from":3409,"to":4020},{"from":4021,"to":4991},{"from":4992,"to":5410},{"from":5411,"to":6168},{"from":6169,"to":6597},{"from":6598,"to":6998},{"from":7062,"to":7278}],"names":["DEFAULT_MAX_ENTRIES","CRASH_LOG_DIR_NAME","MAX_PROCESS_NAME_LENGTH","localISOString","compactTimestamp","installed","writerState","installCrashWriter","wrapChildProcess","writeCrashEntry","buildInitialFile","buildEntry","serializeReason","readExistingFile","sanitizeProcessName"]} as const;
export function createNativeSidecarCrashWriter(runtime:any={}):any {
const process=runtime.process ?? globalThis.process,console=runtime.console ?? globalThis.console;
const node_fs=runtime.fs ?? nodeFs,node_path=nodePath;
// BEGIN ORIGINAL
var DEFAULT_MAX_ENTRIES = 50;
var CRASH_LOG_DIR_NAME = "Crash-Log";
var MAX_PROCESS_NAME_LENGTH = 32;
function localISOString(date = /* @__PURE__ */ new Date()) {
	const offset = -date.getTimezoneOffset();
	const sign = offset >= 0 ? "+" : "-";
	const absOffset = Math.abs(offset);
	const hh = String(Math.floor(absOffset / 60)).padStart(2, "0");
	const mm = String(absOffset % 60).padStart(2, "0");
	const pad = (n, len = 2) => String(n).padStart(len, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}${sign}${hh}:${mm}`;
}
function compactTimestamp(date = /* @__PURE__ */ new Date()) {
	const pad = (n) => String(n).padStart(2, "0");
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
var installed = false;
var writerState = {
	reportPath: null,
	cachedFile: null,
	maxEntries: DEFAULT_MAX_ENTRIES,
	launchedAt: localISOString(),
	startupTag: compactTimestamp()
};
function installCrashWriter(options) {
	const { logsDir, processName, appVersion, extraMeta, maxEntriesPerLaunch } = options;
	writerState.maxEntries = maxEntriesPerLaunch ?? DEFAULT_MAX_ENTRIES;
	writerState.launchedAt = localISOString();
	writerState.startupTag = compactTimestamp();
	const handle = {
		write: (entry) => writeCrashEntry(logsDir, processName, appVersion, extraMeta, entry),
		getReportPath: () => writerState.reportPath
	};
	if (installed) return handle;
	installed = true;
	process.on("uncaughtException", (error) => {
		handle.write({
			type: "uncaught_exception",
			error
		});
	});
	process.on("unhandledRejection", (reason) => {
		handle.write({
			type: "unhandled_rejection",
			error: reason
		});
	});
	return handle;
}
function wrapChildProcess(child, meta, writerHandle) {
	child.on("exit", (code, signal) => {
		if (code === 0 && !signal) return;
		writerHandle.write({
			type: "child_process_crash",
			childProcess: {
				processType: "spawned",
				reason: signal ? `signal:${signal}` : `exit:${code}`,
				exitCode: code ?? -1,
				name: meta.name,
				signal: signal ?? void 0
			}
		});
	});
	child.on("error", (err) => {
		writerHandle.write({
			type: "child_process_crash",
			childProcess: {
				processType: "spawned",
				reason: `spawn-error:${err.message}`,
				exitCode: -1,
				name: meta.name
			}
		});
	});
}
function writeCrashEntry(logsDir, processName, appVersion, extraMeta, input) {
	if (!logsDir) return null;
	try {
		const safeName = sanitizeProcessName(processName);
		const crashLogDir = node_path.join(logsDir, CRASH_LOG_DIR_NAME);
		const filename = `crash-report-${safeName}-${process.pid}-${writerState.startupTag}.json`;
		const reportPath = node_path.join(crashLogDir, filename);
		if (!writerState.reportPath) writerState.reportPath = reportPath;
		node_fs.mkdirSync(crashLogDir, { recursive: true });
		if (!writerState.cachedFile) writerState.cachedFile = readExistingFile(reportPath) ?? buildInitialFile(safeName, appVersion, extraMeta);
		const file = writerState.cachedFile;
		if (file.entries.length >= writerState.maxEntries) file.droppedCount += 1;
		else {
			const entry = buildEntry(input);
			file.entries.push(entry);
		}
		node_fs.writeFileSync(reportPath, JSON.stringify(file, null, 2), "utf8");
		return reportPath;
	} catch {
		return null;
	}
}
function buildInitialFile(processName, appVersion, extraMeta) {
	return {
		launchedAt: writerState.launchedAt,
		pid: process.pid,
		processName,
		versions: {
			node: process.versions.node,
			electron: process.versions.electron,
			chrome: process.versions.chrome,
			v8: process.versions.v8
		},
		platform: process.platform,
		arch: process.arch,
		appVersion,
		extraMeta,
		entries: [],
		droppedCount: 0
	};
}
function buildEntry(input) {
	const timestamp = localISOString();
	const { type, error, renderer, childProcess: childProc } = input;
	if (type === "renderer_crash" && renderer) return {
		timestamp,
		type,
		errorName: "RendererCrash",
		errorMessage: `Renderer process gone: reason=${renderer.reason}, exitCode=${renderer.exitCode}`,
		stack: null,
		renderer
	};
	if (type === "child_process_crash" && childProc) return {
		timestamp,
		type,
		errorName: "ChildProcessCrash",
		errorMessage: `Child process gone (${childProc.serviceName || childProc.name || childProc.processType}): reason=${childProc.reason}, exitCode=${childProc.exitCode}`,
		stack: null,
		childProcess: childProc
	};
	return {
		timestamp,
		type,
		...serializeReason(error)
	};
}
function serializeReason(reason) {
	if (reason instanceof Error) return {
		errorName: reason.name || "Error",
		errorMessage: reason.message ?? "",
		stack: reason.stack ?? null
	};
	let raw;
	try {
		raw = typeof reason === "string" ? reason : JSON.stringify(reason);
	} catch {
		raw = String(reason);
	}
	return {
		errorName: "NonError",
		errorMessage: typeof reason === "string" ? reason : raw,
		stack: null,
		raw
	};
}
function readExistingFile(reportPath) {
	try {
		if (!node_fs.existsSync(reportPath)) return null;
		const raw = node_fs.readFileSync(reportPath, "utf8");
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.entries)) return null;
		if (typeof parsed.droppedCount !== "number") parsed.droppedCount = 0;
		return parsed;
	} catch {
		return null;
	}
}
function sanitizeProcessName(rawName) {
	if (!rawName) return "unknown";
	return rawName.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, MAX_PROCESS_NAME_LENGTH) || "unknown";
}
// END ORIGINAL
return {DEFAULT_MAX_ENTRIES,CRASH_LOG_DIR_NAME,MAX_PROCESS_NAME_LENGTH,localISOString,compactTimestamp,installed,writerState,installCrashWriter,wrapChildProcess,writeCrashEntry,buildInitialFile,buildEntry,serializeReason,readExistingFile,sanitizeProcessName};
}
